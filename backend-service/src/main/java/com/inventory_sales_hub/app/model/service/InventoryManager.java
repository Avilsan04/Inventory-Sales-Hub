package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.exceptions.InventoryException;
import com.inventory_sales_hub.app.model.dto.*;
import com.inventory_sales_hub.app.model.entities.*;
import com.inventory_sales_hub.app.model.persistence.*;
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

    public List<InventoryResponse> getAll() {
        return inventoryDao.findAllWithProduct().stream().map(this::toResponse).toList();
    }

    public InventoryResponse getById(Long id) {
        return inventoryDao.findByIdWithProduct(id)
                .map(this::toResponse)
                .orElseThrow(() -> new InventoryException("Inventory not found"));
    }

    public List<InventoryResponse> getLowStock() {
        return inventoryDao.findLowStock().stream().map(this::toResponse).toList();
    }

    public List<StockMovementResponse> getMovements() {
        return stockMovementDao.findAllOrderByCreatedAtDesc().stream().map(this::toMovementResponse).toList();
    }

    @Transactional
    public InventoryResponse create(CreateInventoryParams params) {
        if (params.sku() != null && productDao.existsBySku(params.sku())) {
            throw new InventoryException("A product with this SKU already exists");
        }

        Category category = params.categoryId() != null
                ? categoryDao.findById(params.categoryId()).orElseThrow(() -> new InventoryException("Category not found"))
                : null;

        Product product = new Product();
        product.setName(params.name());
        product.setDescription(params.description());
        product.setPurchasePrice(params.purchasePrice());
        product.setSalePrice(params.salePrice());
        product.setSku(params.sku());
        product.setCategory(category);
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
        Inventory inventory = inventoryDao.findByIdWithProduct(id)
                .orElseThrow(() -> new InventoryException("Inventory not found"));
        if (params.minStock() != null) inventory.setMinStock(params.minStock());
        return toResponse(inventoryDao.save(inventory));
    }

    @Transactional
    public InventoryResponse updateStock(Long id, PatchStockParams params) {
        Inventory inventory = inventoryDao.findByIdWithProduct(id)
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
        Inventory inventory = inventoryDao.findByIdWithProduct(id)
                .orElseThrow(() -> new InventoryException("Inventory not found"));

        Product product = inventory.getProduct();
        stockMovementDao.deleteAllByInventory(inventory);
        inventoryDao.delete(inventory);
        product.setActive(false);
        productDao.save(product);
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
