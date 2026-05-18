package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.config.TenantContext;
import com.inventory_sales_hub.app.exceptions.InventoryException;
import com.inventory_sales_hub.app.model.dto.*;
import com.inventory_sales_hub.app.model.entities.*;
import com.inventory_sales_hub.app.model.persistence.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryManager {
    @Autowired private InventoryDao inventoryDao;
    @Autowired private StockMovementDao stockMovementDao;
    @Autowired private ProductDao productDao;
    @Autowired private CategoryDao categoryDao;
    @Autowired private TenantContext tenantContext;

    public PaginatedResponse<InventoryResponse> getAll(int page, int pageSize, String search, String status) {
        Long tenantId = tenantContext.currentTenantId();
        String normalizedSearch = (search != null && !search.isBlank()) ? search : null;
        String normalizedStatus = (status != null && !status.isBlank()) ? status.toUpperCase() : null;

        if (tenantId != null) {
            PageRequest pageable = PageRequest.of(page, pageSize);
            Page<Inventory> result = inventoryDao.findPageByTenantAndFilter(tenantId, normalizedSearch, normalizedStatus, pageable);
            List<InventoryResponse> data = result.getContent().stream().map(this::toResponse).toList();
            return new PaginatedResponse<>(data, result.getTotalElements(), page, pageSize);
        }

        // Admin: no tenant filter — fall back to in-memory (admin use-case, acceptable for small datasets)
        List<InventoryResponse> filtered = inventoryDao.findAllWithProduct().stream()
                .filter(i -> normalizedStatus == null || switch (normalizedStatus) {
                    case "LOW_STOCK" -> i.getQuantity() > 0 && i.getQuantity() <= i.getMinStock();
                    case "OUT_OF_STOCK" -> i.getQuantity() == 0;
                    default -> true;
                })
                .filter(i -> normalizedSearch == null
                        || i.getProduct().getName().toLowerCase().contains(normalizedSearch.toLowerCase())
                        || (i.getProduct().getSku() != null && i.getProduct().getSku().toLowerCase().contains(normalizedSearch.toLowerCase())))
                .map(this::toResponse)
                .toList();
        long total = filtered.size();
        int start = page * pageSize;
        List<InventoryResponse> pageData = start < total ? filtered.subList(start, (int) Math.min(start + pageSize, total)) : List.of();
        return new PaginatedResponse<>(pageData, total, page, pageSize);
    }

    public InventoryResponse getById(Long id) {
        Long tenantId = tenantContext.currentTenantId();
        return (tenantId != null
                ? inventoryDao.findByIdWithProductAndTenant(id, tenantId)
                : inventoryDao.findByIdWithProduct(id))
                .map(this::toResponse)
                .orElseThrow(() -> new InventoryException("Inventory not found"));
    }

    public List<InventoryResponse> getLowStock() {
        Long tenantId = tenantContext.currentTenantId();
        return (tenantId != null
                ? inventoryDao.findLowStockByTenant(tenantId)
                : inventoryDao.findLowStock())
                .stream().map(this::toResponse).toList();
    }

    public List<StockMovementResponse> getMovements() {
        return stockMovementDao.findAllOrderByCreatedAtDesc().stream().map(this::toMovementResponse).toList();
    }

    @Transactional
    public InventoryResponse create(CreateInventoryParams params) {
        Long tenantId = requireTenantId();

        if (params.sku() != null && productDao.existsBySkuAndTenantId(params.sku(), tenantId)) {
            throw new InventoryException("A product with this SKU already exists");
        }

        Category category = params.categoryId() != null
                ? categoryDao.findById(params.categoryId())
                    .filter(c -> c.getTenantId().equals(tenantId))
                    .orElseThrow(() -> new InventoryException("Category not found"))
                : null;

        Product product = new Product();
        product.setName(params.name());
        product.setDescription(params.description());
        product.setPurchasePrice(params.purchasePrice());
        product.setSalePrice(params.salePrice());
        product.setSku(params.sku());
        product.setCategory(category);
        product.setTenantId(tenantId);
        product = productDao.save(product);

        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setQuantity(params.quantity());
        if (params.minStock() != null) inventory.setMinStock(params.minStock());
        inventory = inventoryDao.save(inventory);

        if (params.quantity() > 0) {
            recordMovement(inventory, MovementType.IN, params.quantity(), 0, "Initial stock");
        }

        return toResponse(inventory);
    }

    @Transactional
    public InventoryResponse update(Long id, UpdateInventoryParams params) {
        Long tenantId = requireTenantId();
        Inventory inventory = (tenantId != null
                ? inventoryDao.findByIdWithProductAndTenant(id, tenantId)
                : inventoryDao.findByIdWithProduct(id))
                .orElseThrow(() -> new InventoryException("Inventory not found"));
        if (params.minStock() != null) inventory.setMinStock(params.minStock());
        return toResponse(inventoryDao.save(inventory));
    }

    @Transactional
    public InventoryResponse updateStock(Long id, PatchStockParams params) {
        Long tenantId = tenantContext.currentTenantId();
        Inventory inventory = (tenantId != null
                ? inventoryDao.findByIdWithProductAndTenant(id, tenantId)
                : inventoryDao.findByIdWithProduct(id))
                .orElseThrow(() -> new InventoryException("Inventory not found"));

        int previous = inventory.getQuantity();
        int newQty = params.quantity();

        if (newQty < 0) throw new InventoryException("Stock quantity cannot be negative");

        inventory.setQuantity(newQty);
        inventoryDao.save(inventory);

        int delta = Math.abs(newQty - previous);
        if (delta > 0) {
            MovementType type = newQty > previous ? MovementType.IN : MovementType.OUT;
            recordMovement(inventory, type, delta, previous, params.note());
        }

        return toResponse(inventory);
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = requireTenantId();
        Inventory inventory = (tenantId != null
                ? inventoryDao.findByIdWithProductAndTenant(id, tenantId)
                : inventoryDao.findByIdWithProduct(id))
                .orElseThrow(() -> new InventoryException("Inventory not found"));

        Product product = inventory.getProduct();
        stockMovementDao.deleteAllByInventory(inventory);
        inventoryDao.delete(inventory);
        product.setActive(false);
        productDao.save(product);
    }

    private Long requireTenantId() {
        Long tenantId = tenantContext.currentTenantId();
        if (tenantId == null) throw new InventoryException("No tenant context");
        return tenantId;
    }

    private void recordMovement(Inventory inventory, MovementType type, int quantity, int previousStock, String note) {
        StockMovement movement = new StockMovement();
        movement.setInventory(inventory);
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setPreviousStock(previousStock);
        movement.setNewStock(inventory.getQuantity());
        movement.setNote(note);
        stockMovementDao.save(movement);
    }

    private InventoryResponse toResponse(Inventory i) {
        Product p = i.getProduct();
        CategoryResponse category = p.getCategory() != null
                ? new CategoryResponse(p.getCategory().getId(), p.getCategory().getName(), p.getCategory().getDescription())
                : null;
        Long supplierId = p.getSupplier() != null ? p.getSupplier().getId() : null;
        String supplierName = p.getSupplier() != null ? p.getSupplier().getName() : null;
        ProductResponse product = new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getPurchasePrice(), p.getSalePrice(), p.getSku(), category, supplierId, supplierName, p.isActive());
        return new InventoryResponse(i.getId(), product, i.getQuantity(), i.getMinStock(), i.getQuantity() <= i.getMinStock());
    }

    private StockMovementResponse toMovementResponse(StockMovement m) {
        return new StockMovementResponse(
                m.getId(), m.getInventory().getId(), m.getType().name(),
                m.getQuantity(), m.getPreviousStock(), m.getNewStock(),
                m.getNote(), m.getCreatedAt()
        );
    }
}
