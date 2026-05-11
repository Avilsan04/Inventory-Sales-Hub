package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.exceptions.SaleException;
import com.inventory_sales_hub.app.model.dto.*;
import com.inventory_sales_hub.app.model.entities.*;
import com.inventory_sales_hub.app.model.persistence.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SaleManager {
    private static final BigDecimal TAX_RATE = new BigDecimal("0.21");

    @Autowired private SaleDao saleDao;
    @Autowired private SaleItemDao saleItemDao;
    @Autowired private ProductDao productDao;
    @Autowired private CustomerDao customerDao;
    @Autowired private UserDao userDao;
    @Autowired private InventoryDao inventoryDao;
    @Autowired private StockMovementDao stockMovementDao;

    public List<SaleResponse> getAll() {
        List<Sale> sales = saleDao.findAllWithDetails();
        if (sales.isEmpty()) return List.of();
        List<SaleItem> allItems = saleItemDao.findBySalesWithProduct(sales);
        Map<Long, List<SaleItem>> bySaleId = allItems.stream()
                .collect(Collectors.groupingBy(si -> si.getSale().getId()));
        return sales.stream()
                .map(s -> toResponse(s, bySaleId.getOrDefault(s.getId(), List.of())))
                .toList();
    }

    public SaleResponse getById(Long id) {
        Sale sale = saleDao.findByIdWithDetails(id)
                .orElseThrow(() -> new SaleException("Sale not found"));
        return toResponse(sale, saleItemDao.findBySaleIdWithProduct(id));
    }

    public List<SaleItemResponse> getItems(Long saleId) {
        if (!saleDao.existsById(saleId)) throw new SaleException("Sale not found");
        return saleItemDao.findBySaleIdWithProduct(saleId).stream().map(this::toItemResponse).toList();
    }

    public SaleSummaryResponse getSummary() {
        ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
        Instant todayStart = now.truncatedTo(ChronoUnit.DAYS).toInstant();
        Instant todayEnd = todayStart.plus(1, ChronoUnit.DAYS);
        Instant monthStart = now.withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS).toInstant();
        Instant monthEnd = now.plusMonths(1).withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS).toInstant();

        SalePeriodStats today = new SalePeriodStats(
                saleDao.sumRevenueBetween(SaleStatus.COMPLETED, todayStart, todayEnd),
                saleDao.countBetween(SaleStatus.COMPLETED, todayStart, todayEnd),
                saleItemDao.sumNetProfitBetween(SaleStatus.COMPLETED, todayStart, todayEnd)
        );
        SalePeriodStats month = new SalePeriodStats(
                saleDao.sumRevenueBetween(SaleStatus.COMPLETED, monthStart, monthEnd),
                saleDao.countBetween(SaleStatus.COMPLETED, monthStart, monthEnd),
                saleItemDao.sumNetProfitBetween(SaleStatus.COMPLETED, monthStart, monthEnd)
        );

        List<TopProductResponse> topProducts = saleItemDao
                .findTopProducts(SaleStatus.COMPLETED, PageRequest.of(0, 5))
                .stream()
                .map(row -> new TopProductResponse((Long) row[0], (String) row[1], ((Number) row[2]).longValue()))
                .toList();

        return new SaleSummaryResponse(today, month, topProducts);
    }

    @Transactional
    public SaleResponse create(CreateSaleParams params, Long userId) {
        if (params.items() == null || params.items().isEmpty()) {
            throw new SaleException("A sale must have at least one item");
        }

        User user = userDao.findById(userId).orElseThrow(() -> new SaleException("User not found"));
        Customer customer = params.customerId() != null
                ? customerDao.findById(params.customerId()).orElseThrow(() -> new SaleException("Customer not found"))
                : null;

        // Validate items and pre-calculate totals before any DB insert
        record ResolvedItem(Product product, int quantity, BigDecimal unitPrice, BigDecimal subtotal) {}
        List<ResolvedItem> resolved = new java.util.ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (SaleItemParams itemParam : params.items()) {
            if (itemParam.quantity() <= 0) throw new SaleException("Item quantity must be positive");
            Product product = productDao.findById(itemParam.productId())
                    .orElseThrow(() -> new SaleException("Product not found: " + itemParam.productId()));
            BigDecimal unitPrice = product.getSalePrice();
            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(itemParam.quantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(itemSubtotal);
            resolved.add(new ResolvedItem(product, itemParam.quantity(), unitPrice, itemSubtotal));
        }

        BigDecimal taxAmount = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);

        Sale sale = new Sale();
        sale.setProcessedBy(user);
        sale.setCustomer(customer);
        sale.setTaxRate(TAX_RATE);
        sale.setSubtotal(subtotal);
        sale.setTaxAmount(taxAmount);
        sale.setTotal(subtotal.add(taxAmount));
        Sale savedSale = saleDao.save(sale);

        for (ResolvedItem ri : resolved) {
            SaleItem item = new SaleItem();
            item.setSale(savedSale);
            item.setProduct(ri.product());
            item.setQuantity(ri.quantity());
            item.setUnitPrice(ri.unitPrice());
            item.setSubtotal(ri.subtotal());
            saleItemDao.save(item);
        }

        return toResponse(savedSale, saleItemDao.findBySaleIdWithProduct(savedSale.getId()));
    }

    @Transactional
    public SaleResponse updateStatus(Long id, PatchSaleStatusParams params) {
        Sale sale = saleDao.findByIdWithDetails(id)
                .orElseThrow(() -> new SaleException("Sale not found"));

        if (sale.getStatus() == SaleStatus.CANCELLED) {
            throw new SaleException("Cannot change the status of a cancelled sale");
        }

        SaleStatus newStatus;
        try {
            newStatus = SaleStatus.valueOf(params.status().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new SaleException("Invalid status: " + params.status());
        }

        if (sale.getStatus() == newStatus) {
            return toResponse(sale, saleItemDao.findBySaleIdWithProduct(id));
        }

        List<SaleItem> items = saleItemDao.findBySaleIdWithProduct(id);

        if (newStatus == SaleStatus.COMPLETED) {
            for (SaleItem item : items) {
                int affected = inventoryDao.deductStock(item.getProduct().getId(), item.getQuantity());
                if (affected == 0) {
                    Inventory inv = inventoryDao.findByProductId(item.getProduct().getId())
                            .orElseThrow(() -> new SaleException("No inventory for product: " + item.getProduct().getName()));
                    throw new SaleException("Insufficient stock for: " + item.getProduct().getName()
                            + " (available: " + inv.getQuantity() + ")");
                }
                Inventory inventory = inventoryDao.findByProductId(item.getProduct().getId()).orElseThrow();
                recordStockMovement(inventory, MovementType.OUT, item.getQuantity(),
                        inventory.getQuantity() + item.getQuantity(), "Sale #" + id);
            }
        } else if (newStatus == SaleStatus.CANCELLED && sale.getStatus() == SaleStatus.COMPLETED) {
            for (SaleItem item : items) {
                inventoryDao.findByProductId(item.getProduct().getId()).ifPresent(inventory -> {
                    int previous = inventory.getQuantity();
                    inventory.setQuantity(previous + item.getQuantity());
                    inventoryDao.save(inventory);
                    recordStockMovement(inventory, MovementType.IN, item.getQuantity(), previous, "Sale #" + id + " cancelled");
                });
            }
        }

        sale.setStatus(newStatus);
        sale.setUpdatedAt(Instant.now());
        saleDao.save(sale);

        return toResponse(sale, items);
    }

    private void recordStockMovement(Inventory inventory, MovementType type, int quantity, int previousStock, String note) {
        StockMovement movement = new StockMovement();
        movement.setInventory(inventory);
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setPreviousStock(previousStock);
        movement.setNewStock(inventory.getQuantity());
        movement.setNote(note);
        stockMovementDao.save(movement);
    }

    private SaleResponse toResponse(Sale s, List<SaleItem> items) {
        CustomerResponse customer = s.getCustomer() != null
                ? new CustomerResponse(s.getCustomer().getId(), s.getCustomer().getName(), s.getCustomer().getEmail(), s.getCustomer().getPhone())
                : null;
        List<SaleItemResponse> itemResponses = items.stream().map(this::toItemResponse).toList();
        return new SaleResponse(s.getId(), customer, s.getProcessedBy().getUsername(), s.getStatus().name(),
                s.getSubtotal(), s.getTaxRate(), s.getTaxAmount(), s.getTotal(),
                s.getCreatedAt(), s.getUpdatedAt(), itemResponses);
    }

    private SaleItemResponse toItemResponse(SaleItem si) {
        return new SaleItemResponse(si.getId(), si.getProduct().getId(), si.getProduct().getName(),
                si.getQuantity(), si.getUnitPrice(), si.getSubtotal());
    }
}
