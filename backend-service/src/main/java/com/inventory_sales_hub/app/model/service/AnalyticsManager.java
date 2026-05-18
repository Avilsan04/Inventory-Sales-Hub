package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.model.dto.*;
import com.inventory_sales_hub.app.model.entities.Inventory;
import com.inventory_sales_hub.app.model.entities.Sale;
import com.inventory_sales_hub.app.model.entities.SaleStatus;
import com.inventory_sales_hub.app.model.persistence.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsManager {

    @Autowired private SaleDao saleDao;
    @Autowired private SaleItemDao saleItemDao;
    @Autowired private InventoryDao inventoryDao;
    @Autowired private ProductDao productDao;
    @Autowired private CustomerDao customerDao;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Instant startOfDay   = today.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endOfDay     = today.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant startOfMonth = today.withDayOfMonth(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endOfMonth   = today.withDayOfMonth(1).plusMonths(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant startOfYear  = today.withDayOfYear(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endOfYear    = today.withDayOfYear(1).plusYears(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        SaleStatus completed = SaleStatus.COMPLETED;

        BigDecimal revenueToday      = saleDao.sumRevenueBetween(completed, startOfDay, endOfDay);
        BigDecimal revenueThisMonth  = saleDao.sumRevenueBetween(completed, startOfMonth, endOfMonth);
        BigDecimal revenueThisYear   = saleDao.sumRevenueBetween(completed, startOfYear, endOfYear);
        long salesToday     = saleDao.countBetween(completed, startOfDay, endOfDay);
        long salesThisMonth = saleDao.countBetween(completed, startOfMonth, endOfMonth);
        long salesThisYear  = saleDao.countBetween(completed, startOfYear, endOfYear);

        long totalActiveProducts = productDao.countByActiveTrue();
        long totalCustomers      = customerDao.count();
        int lowStockCount        = inventoryDao.findLowStock().size();

        List<Inventory> allInventory = inventoryDao.findAllWithProduct();
        BigDecimal inventoryValue = allInventory.stream()
                .filter(i -> i.getProduct().isActive())
                .map(i -> i.getProduct().getPurchasePrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        return new DashboardResponse(revenueToday, revenueThisMonth, revenueThisYear,
                salesToday, salesThisMonth, salesThisYear,
                totalActiveProducts, totalCustomers, lowStockCount, inventoryValue);
    }

    @Transactional(readOnly = true)
    public List<SalesPeriodDataPoint> getSalesAnalytics(LocalDate startDate, LocalDate endDate) {
        Instant start = startDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant end   = endDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<Sale> sales = saleDao.findByStatusAndPeriod(SaleStatus.COMPLETED, start, end);

        Map<LocalDate, List<Sale>> byDay = sales.stream().collect(
                Collectors.groupingBy(s -> s.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate()));

        List<SalesPeriodDataPoint> result = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            List<Sale> daySales = byDay.getOrDefault(current, List.of());
            BigDecimal revenue = daySales.stream()
                    .map(Sale::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .setScale(2, RoundingMode.HALF_UP);
            result.add(new SalesPeriodDataPoint(current, revenue, daySales.size()));
            current = current.plusDays(1);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<TopProductResponse> getTopProducts(int limit) {
        return saleItemDao.findTopProducts(SaleStatus.COMPLETED, PageRequest.of(0, limit))
                .stream()
                .map(r -> new TopProductResponse(
                        ((Number) r[0]).longValue(),
                        (String) r[1],
                        ((Number) r[2]).longValue()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TopCustomerResponse> getTopCustomers(int limit) {
        return saleDao.findTopCustomers(SaleStatus.COMPLETED, PageRequest.of(0, limit))
                .stream()
                .map(r -> new TopCustomerResponse(
                        ((Number) r[0]).longValue(),
                        (String) r[1],
                        ((Number) r[2]).longValue(),
                        (BigDecimal) r[3]))
                .toList();
    }

    @Transactional(readOnly = true)
    public InventoryValueResponse getInventoryValue() {
        List<Inventory> all = inventoryDao.findAllWithProduct();
        BigDecimal purchaseValue = BigDecimal.ZERO;
        BigDecimal saleValue = BigDecimal.ZERO;
        int totalUnits = 0;
        int totalProducts = 0;

        for (Inventory i : all) {
            if (!i.getProduct().isActive()) continue;
            BigDecimal qty = BigDecimal.valueOf(i.getQuantity());
            purchaseValue = purchaseValue.add(i.getProduct().getPurchasePrice().multiply(qty));
            saleValue     = saleValue.add(i.getProduct().getSalePrice().multiply(qty));
            totalUnits    += i.getQuantity();
            totalProducts++;
        }

        return new InventoryValueResponse(
                purchaseValue.setScale(2, RoundingMode.HALF_UP),
                saleValue.setScale(2, RoundingMode.HALF_UP),
                totalUnits, totalProducts);
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockAlerts() {
        return inventoryDao.findLowStock().stream().map(i -> {
            ProductResponse p = toProductResponse(i.getProduct());
            return new InventoryResponse(i.getId(), p, i.getQuantity(), i.getMinStock(), true);
        }).toList();
    }

    private ProductResponse toProductResponse(com.inventory_sales_hub.app.model.entities.Product p) {
        CategoryResponse category = p.getCategory() != null
                ? new CategoryResponse(p.getCategory().getId(), p.getCategory().getName(), p.getCategory().getDescription())
                : null;
        Long supplierId   = p.getSupplier() != null ? p.getSupplier().getId() : null;
        String supplierName = p.getSupplier() != null ? p.getSupplier().getName() : null;
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(),
                p.getPurchasePrice(), p.getSalePrice(), p.getSku(),
                category, supplierId, supplierName, p.isActive());
    }
}
