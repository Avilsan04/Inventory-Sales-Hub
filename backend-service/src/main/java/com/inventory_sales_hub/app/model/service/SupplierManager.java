package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.config.TenantContext;
import com.inventory_sales_hub.app.exceptions.SupplierException;
import com.inventory_sales_hub.app.model.dto.*;
import com.inventory_sales_hub.app.model.entities.*;
import com.inventory_sales_hub.app.model.persistence.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
    @Autowired private TenantContext tenantContext;

    public List<SupplierResponse> getAll() {
        Long tenantId = tenantContext.currentTenantId();
        return (tenantId != null
                ? supplierDao.findByTenantId(tenantId, PageRequest.of(0, Integer.MAX_VALUE, Sort.by("name"))).getContent()
                : supplierDao.findAll())
                .stream().map(this::toResponse).toList();
    }

    public PaginatedResponse<SupplierResponse> getAllPaginated(int page, int size, String search) {
        Long tenantId = tenantContext.currentTenantId();
        PageRequest pageable = PageRequest.of(page, size, Sort.by("name"));
        Page<Supplier> p;
        if (tenantId != null) {
            p = (search != null && !search.isBlank())
                    ? supplierDao.findByTenantIdAndSearch(tenantId, search, pageable)
                    : supplierDao.findByTenantId(tenantId, pageable);
        } else {
            p = (search != null && !search.isBlank())
                    ? supplierDao.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable)
                    : supplierDao.findAll(pageable);
        }
        List<SupplierResponse> data = p.getContent().stream().map(this::toResponse).toList();
        return new PaginatedResponse<>(data, p.getTotalElements(), page, size);
    }

    public SupplierResponse getById(Long id) {
        Long tenantId = tenantContext.currentTenantId();
        return (tenantId != null
                ? supplierDao.findById(id).filter(s -> s.getTenantId().equals(tenantId))
                : supplierDao.findById(id))
                .map(this::toResponse)
                .orElseThrow(() -> new SupplierException("Supplier not found"));
    }

    public List<ProductResponse> getProducts(Long id) {
        Long tenantId = tenantContext.currentTenantId();
        if (supplierDao.findById(id)
                .filter(s -> tenantId == null || s.getTenantId().equals(tenantId))
                .isEmpty()) {
            throw new SupplierException("Supplier not found");
        }
        List<Product> products = tenantId != null
                ? productDao.findActiveBySupplierAndTenant(id, tenantId)
                : productDao.findActiveBySupplier(id);
        return products.stream().map(this::toProductResponse).toList();
    }

    @Transactional
    public SupplierResponse create(SupplierParams params) {
        Long tenantId = requireTenantId();
        if (params.email() != null && supplierDao.existsByEmailAndTenantId(params.email(), tenantId)) {
            throw new SupplierException("A supplier with this email already exists");
        }
        Supplier supplier = new Supplier();
        supplier.setName(params.name());
        supplier.setEmail(params.email());
        supplier.setPhone(params.phone());
        supplier.setAddress(params.address());
        supplier.setTenantId(tenantId);
        return toResponse(supplierDao.save(supplier));
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierParams params) {
        Long tenantId = requireTenantId();
        Supplier supplier = supplierDao.findById(id)
                .filter(s -> s.getTenantId().equals(tenantId))
                .orElseThrow(() -> new SupplierException("Supplier not found"));

        if (params.email() != null && !params.email().equals(supplier.getEmail())
                && supplierDao.existsByEmailAndIdNotAndTenantId(params.email(), id, tenantId)) {
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
        Long tenantId = requireTenantId();
        Supplier supplier = supplierDao.findById(id)
                .filter(s -> s.getTenantId().equals(tenantId))
                .orElseThrow(() -> new SupplierException("Supplier not found"));
        if (productDao.existsBySupplierIdAndTenantId(id, tenantId)) {
            throw new SupplierException("Cannot delete supplier with associated products");
        }
        if (supplierOrderDao.existsBySupplier(supplier)) {
            throw new SupplierException("Cannot delete supplier with existing orders");
        }
        supplierDao.delete(supplier);
    }

    @Transactional
    public SupplierOrderResponse createOrder(Long supplierId, CreateSupplierOrderParams params) {
        Long tenantId = requireTenantId();
        Supplier supplier = supplierDao.findById(supplierId)
                .filter(s -> s.getTenantId().equals(tenantId))
                .orElseThrow(() -> new SupplierException("Supplier not found"));

        if (params.items() == null || params.items().isEmpty()) {
            throw new SupplierException("Order must contain at least one item");
        }

        record ResolvedItem(Product product, int quantity, BigDecimal unitPrice, BigDecimal subtotal) {}
        List<ResolvedItem> resolved = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (SupplierOrderItemParams item : params.items()) {
            Product product = productDao.findByIdAndActiveTrueAndTenantId(item.productId(), tenantId)
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

    private Long requireTenantId() {
        Long tenantId = tenantContext.currentTenantId();
        if (tenantId == null) throw new SupplierException("No tenant context");
        return tenantId;
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
