package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.exceptions.SupplierException;
import com.inventory_sales_hub.app.model.dto.*;
import com.inventory_sales_hub.app.model.entities.*;
import com.inventory_sales_hub.app.model.persistence.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class SupplierManager {

    @Autowired private SupplierDao supplierDao;
    @Autowired private SupplierOrderDao supplierOrderDao;
    @Autowired private SupplierOrderItemDao supplierOrderItemDao;
    @Autowired private ProductDao productDao;

    public List<SupplierResponse> getAll() {
        return supplierDao.findAll().stream().map(this::toResponse).toList();
    }

    public SupplierResponse getById(Long id) {
        return supplierDao.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new SupplierException("Supplier not found"));
    }

    public List<ProductResponse> getProducts(Long id) {
        if (!supplierDao.existsById(id)) throw new SupplierException("Supplier not found");
        return productDao.findActiveBySupplier(id).stream().map(this::toProductResponse).toList();
    }

    @Transactional
    public SupplierResponse create(SupplierParams params) {
        if (params.email() != null && supplierDao.existsByEmail(params.email())) {
            throw new SupplierException("A supplier with this email already exists");
        }
        Supplier supplier = new Supplier();
        supplier.setName(params.name());
        supplier.setEmail(params.email());
        supplier.setPhone(params.phone());
        supplier.setAddress(params.address());
        return toResponse(supplierDao.save(supplier));
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierParams params) {
        Supplier supplier = supplierDao.findById(id)
                .orElseThrow(() -> new SupplierException("Supplier not found"));
        if (params.email() != null && !params.email().equals(supplier.getEmail())
                && supplierDao.existsByEmailAndIdNot(params.email(), id)) {
            throw new SupplierException("A supplier with this email already exists");
        }
        supplier.setName(params.name());
        supplier.setEmail(params.email());
        supplier.setPhone(params.phone());
        supplier.setAddress(params.address());
        return toResponse(supplierDao.save(supplier));
    }

    @Transactional
    public void delete(Long id) {
        Supplier supplier = supplierDao.findById(id)
                .orElseThrow(() -> new SupplierException("Supplier not found"));
        if (productDao.existsBySupplierId(id)) {
            throw new SupplierException("Cannot delete supplier with associated products");
        }
        if (supplierOrderDao.existsBySupplier(supplier)) {
            throw new SupplierException("Cannot delete supplier with existing orders");
        }
        supplierDao.delete(supplier);
    }

    @Transactional
    public SupplierOrderResponse createOrder(Long supplierId, CreateSupplierOrderParams params) {
        Supplier supplier = supplierDao.findById(supplierId)
                .orElseThrow(() -> new SupplierException("Supplier not found"));
        if (params.items() == null || params.items().isEmpty()) {
            throw new SupplierException("Order must contain at least one item");
        }

        record ResolvedItem(Product product, int quantity, BigDecimal unitPrice, BigDecimal subtotal) {}
        List<ResolvedItem> resolved = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (SupplierOrderItemParams item : params.items()) {
            Product product = productDao.findByIdAndActiveTrue(item.productId())
                    .orElseThrow(() -> new SupplierException("Product not found: " + item.productId()));
            BigDecimal subtotal = item.unitPrice()
                    .multiply(BigDecimal.valueOf(item.quantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            total = total.add(subtotal);
            resolved.add(new ResolvedItem(product, item.quantity(), item.unitPrice(), subtotal));
        }

        SupplierOrder order = new SupplierOrder();
        order.setSupplier(supplier);
        order.setTotalAmount(total.setScale(2, RoundingMode.HALF_UP));
        SupplierOrder savedOrder = supplierOrderDao.save(order);

        List<SupplierOrderItem> items = new ArrayList<>();
        for (ResolvedItem r : resolved) {
            SupplierOrderItem item = new SupplierOrderItem();
            item.setOrder(savedOrder);
            item.setProduct(r.product());
            item.setQuantity(r.quantity());
            item.setUnitPrice(r.unitPrice());
            item.setSubtotal(r.subtotal());
            items.add(item);
        }
        supplierOrderItemDao.saveAll(items);

        List<SupplierOrderItemResponse> itemResponses = items.stream()
                .map(i -> new SupplierOrderItemResponse(
                        i.getProduct().getId(), i.getProduct().getName(),
                        i.getQuantity(), i.getUnitPrice(), i.getSubtotal()))
                .toList();

        return new SupplierOrderResponse(
                savedOrder.getId(), supplier.getId(), supplier.getName(),
                savedOrder.getStatus().name(), savedOrder.getTotalAmount(),
                itemResponses, savedOrder.getCreatedAt());
    }

    private SupplierResponse toResponse(Supplier s) {
        return new SupplierResponse(s.getId(), s.getName(), s.getEmail(), s.getPhone(), s.getAddress());
    }

    private ProductResponse toProductResponse(Product p) {
        CategoryResponse category = p.getCategory() != null
                ? new CategoryResponse(p.getCategory().getId(), p.getCategory().getName(), p.getCategory().getDescription())
                : null;
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(),
                p.getPurchasePrice(), p.getSalePrice(), p.getSku(), category,
                p.getSupplier() != null ? p.getSupplier().getId() : null,
                p.getSupplier() != null ? p.getSupplier().getName() : null,
                p.isActive());
    }
}
