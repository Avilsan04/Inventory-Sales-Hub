package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.config.TenantContext;
import com.inventory_sales_hub.app.exceptions.SaleException;
import com.inventory_sales_hub.app.model.dto.*;
import com.inventory_sales_hub.app.model.entities.*;
import com.inventory_sales_hub.app.model.persistence.*;
import jakarta.persistence.criteria.JoinType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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

    @Value("${app.tax.rate:0.21}")
    private BigDecimal taxRate;

    @Autowired private SaleDao saleDao;
    @Autowired private SaleItemDao saleItemDao;
    @Autowired private ProductDao productDao;
    @Autowired private CustomerDao customerDao;
    @Autowired private UserDao userDao;
    @Autowired private InventoryDao inventoryDao;
    @Autowired private AuditService auditService;
    @Autowired private StockMovementDao stockMovementDao;
    @Autowired private TenantContext tenantContext;

    public List<SaleResponse> getMyOrders(Long userId) {
        Long tenantId = tenantContext.currentTenantId();
        User user = userDao.findById(userId).orElseThrow(() -> new SaleException("User not found"));
        List<Sale> sales = tenantId != null
                ? saleDao.findAllByCustomerEmailAndTenant(user.getEmail(), tenantId)
                : saleDao.findAllByCustomerEmail(user.getEmail());
        if (sales.isEmpty()) return List.of();
        List<SaleItem> allItems = saleItemDao.findBySalesWithProduct(sales);
        Map<Long, List<SaleItem>> bySaleId = allItems.stream()
                .collect(Collectors.groupingBy(si -> si.getSale().getId()));
        return sales.stream()
                .map(s -> toResponse(s, bySaleId.getOrDefault(s.getId(), List.of())))
                .toList();
    }

    public List<SaleResponse> getAll() {
        Long tenantId = tenantContext.currentTenantId();
        List<Sale> sales = tenantId != null
                ? saleDao.findAllWithDetailsByTenant(tenantId)
                : saleDao.findAllWithDetails();
        if (sales.isEmpty()) return List.of();
        List<SaleItem> allItems = saleItemDao.findBySalesWithProduct(sales);
        Map<Long, List<SaleItem>> bySaleId = allItems.stream()
                .collect(Collectors.groupingBy(si -> si.getSale().getId()));
        return sales.stream()
                .map(s -> toResponse(s, bySaleId.getOrDefault(s.getId(), List.of())))
                .toList();
    }

    public PaginatedResponse<SaleResponse> getAllPaginated(int page, int size, String search, Instant dateFrom, Instant dateTo) {
        Long tenantId = tenantContext.currentTenantId();
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String searchTerm = (search != null && !search.isBlank()) ? search.toLowerCase() : null;

        Specification<Sale> spec = (root, query, cb) -> cb.conjunction();

        if (tenantId != null) {
            Long tid = tenantId;
            spec = spec.and((root, query, cb) -> cb.equal(root.get("tenantId"), tid));
        }
        if (searchTerm != null) {
            String term = searchTerm;
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("id").as(String.class)), "%" + term + "%"),
                cb.like(cb.lower(root.join("customer", JoinType.LEFT).get("name")), "%" + term + "%")
            ));
        }
        if (dateFrom != null) {
            Instant df = dateFrom;
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), df));
        }
        if (dateTo != null) {
            Instant dt = dateTo;
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), dt));
        }

        Page<Sale> salePage = saleDao.findAll(spec, pageable);
        List<Sale> sales = salePage.getContent();
        if (sales.isEmpty()) return new PaginatedResponse<>(List.of(), salePage.getTotalElements(), page, size);

        List<SaleItem> allItems = saleItemDao.findBySalesWithProduct(sales);
        Map<Long, List<SaleItem>> bySaleId = allItems.stream()
                .collect(Collectors.groupingBy(si -> si.getSale().getId()));
        List<SaleResponse> data = sales.stream()
                .map(s -> toResponse(s, bySaleId.getOrDefault(s.getId(), List.of())))
                .toList();
        return new PaginatedResponse<>(data, salePage.getTotalElements(), page, size);
    }

    public List<SaleResponse> getRecent(int limit) {
        Long tenantId = tenantContext.currentTenantId();
        PageRequest pageable = PageRequest.of(0, limit);
        List<Sale> sales = tenantId != null
                ? saleDao.findRecentByTenant(tenantId, pageable)
                : saleDao.findRecent(pageable);
        if (sales.isEmpty()) return List.of();
        List<SaleItem> allItems = saleItemDao.findBySalesWithProduct(sales);
        Map<Long, List<SaleItem>> bySaleId = allItems.stream()
                .collect(Collectors.groupingBy(si -> si.getSale().getId()));
        return sales.stream()
                .map(s -> toResponse(s, bySaleId.getOrDefault(s.getId(), List.of())))
                .toList();
    }

    public SaleResponse getById(Long id) {
        Long tenantId = tenantContext.currentTenantId();
        Sale sale = (tenantId != null
                ? saleDao.findByIdWithDetailsAndTenant(id, tenantId)
                : saleDao.findByIdWithDetails(id))
                .orElseThrow(() -> new SaleException("Sale not found"));
        return toResponse(sale, saleItemDao.findBySaleIdWithProduct(id));
    }

    public List<SaleItemResponse> getItems(Long saleId) {
        if (!saleDao.existsById(saleId)) throw new SaleException("Sale not found");
        return saleItemDao.findBySaleIdWithProduct(saleId).stream().map(this::toItemResponse).toList();
    }

    public SaleSummaryResponse getSummary() {
        Long tenantId = tenantContext.currentTenantId();
        ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
        Instant todayStart = now.truncatedTo(ChronoUnit.DAYS).toInstant();
        Instant todayEnd = todayStart.plus(1, ChronoUnit.DAYS);
        Instant monthStart = now.withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS).toInstant();
        Instant monthEnd = now.plusMonths(1).withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS).toInstant();

        BigDecimal todayRevenue = tenantId != null
                ? saleDao.sumRevenueBetweenAndTenant(SaleStatus.COMPLETED, todayStart, todayEnd, tenantId)
                : saleDao.sumRevenueBetween(SaleStatus.COMPLETED, todayStart, todayEnd);
        long todayCount = tenantId != null
                ? saleDao.countBetweenAndTenant(SaleStatus.COMPLETED, todayStart, todayEnd, tenantId)
                : saleDao.countBetween(SaleStatus.COMPLETED, todayStart, todayEnd);
        BigDecimal monthRevenue = tenantId != null
                ? saleDao.sumRevenueBetweenAndTenant(SaleStatus.COMPLETED, monthStart, monthEnd, tenantId)
                : saleDao.sumRevenueBetween(SaleStatus.COMPLETED, monthStart, monthEnd);
        long monthCount = tenantId != null
                ? saleDao.countBetweenAndTenant(SaleStatus.COMPLETED, monthStart, monthEnd, tenantId)
                : saleDao.countBetween(SaleStatus.COMPLETED, monthStart, monthEnd);

        SalePeriodStats today = new SalePeriodStats(todayRevenue,
                todayCount,
                saleItemDao.sumNetProfitBetween(SaleStatus.COMPLETED, todayStart, todayEnd));
        SalePeriodStats month = new SalePeriodStats(monthRevenue,
                monthCount,
                saleItemDao.sumNetProfitBetween(SaleStatus.COMPLETED, monthStart, monthEnd));

        PageRequest top5 = PageRequest.of(0, 5);
        List<TopProductResponse> topProducts = saleItemDao
                .findTopProducts(SaleStatus.COMPLETED, top5)
                .stream()
                .map(row -> new TopProductResponse((Long) row[0], (String) row[1], ((Number) row[2]).longValue()))
                .toList();

        return new SaleSummaryResponse(today, month, topProducts);
    }

    @Transactional
    public SaleResponse create(CreateSaleParams params, Long userId) {
        Long tenantId = requireTenantId();

        if (params.items() == null || params.items().isEmpty()) {
            throw new SaleException("A sale must have at least one item");
        }

        User user = userDao.findById(userId).orElseThrow(() -> new SaleException("User not found"));
        Customer customer = params.customerId() != null
                ? customerDao.findByIdAndTenantId(params.customerId(), tenantId)
                    .orElseThrow(() -> new SaleException("Customer not found"))
                : null;

        record ResolvedItem(Product product, int quantity, BigDecimal unitPrice, BigDecimal subtotal) {}
        List<ResolvedItem> resolved = new java.util.ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (SaleItemParams itemParam : params.items()) {
            if (itemParam.quantity() <= 0) throw new SaleException("Item quantity must be positive");
            Product product = productDao.findByIdAndActiveTrueAndTenantId(itemParam.productId(), tenantId)
                    .orElseThrow(() -> new SaleException("Product not found: " + itemParam.productId()));
            BigDecimal unitPrice = product.getSalePrice();
            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(itemParam.quantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(itemSubtotal);
            resolved.add(new ResolvedItem(product, itemParam.quantity(), unitPrice, itemSubtotal));
        }

        BigDecimal taxAmount = subtotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);

        Sale sale = new Sale();
        sale.setProcessedBy(user);
        sale.setCustomer(customer);
        sale.setTaxRate(taxRate);
        sale.setSubtotal(subtotal);
        sale.setTaxAmount(taxAmount);
        sale.setTotal(subtotal.add(taxAmount));
        sale.setTenantId(tenantId);
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

        List<SaleItem> savedItems = saleItemDao.findBySaleIdWithProduct(savedSale.getId());
        auditService.record(userId, user.getUsername(), AuditAction.CREATE, AuditEntityType.SALE,
                String.valueOf(savedSale.getId()), null,
                Map.of("total", savedSale.getTotal(), "status", savedSale.getStatus().name()), null);
        return toResponse(savedSale, savedItems);
    }

    @Transactional
    public SaleResponse updateStatus(Long id, PatchSaleStatusParams params) {
        Long tenantId = tenantContext.currentTenantId();
        Sale sale = (tenantId != null
                ? saleDao.findByIdWithDetailsAndTenant(id, tenantId)
                : saleDao.findByIdWithDetails(id))
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

        SaleStatus oldStatus = sale.getStatus();
        sale.setStatus(newStatus);
        sale.setUpdatedAt(Instant.now());
        saleDao.save(sale);

        auditService.record(sale.getProcessedBy().getId(), sale.getProcessedBy().getUsername(),
                AuditAction.STATUS_CHANGE, AuditEntityType.SALE, String.valueOf(id),
                Map.of("status", oldStatus.name()), Map.of("status", newStatus.name()), null);

        return toResponse(sale, items);
    }

    private Long requireTenantId() {
        Long tenantId = tenantContext.currentTenantId();
        if (tenantId == null) throw new SaleException("No tenant context");
        return tenantId;
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
