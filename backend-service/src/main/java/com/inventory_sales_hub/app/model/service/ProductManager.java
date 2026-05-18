package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.config.TenantContext;
import com.inventory_sales_hub.app.exceptions.ProductException;
import com.inventory_sales_hub.app.model.dto.CategoryParams;
import com.inventory_sales_hub.app.model.dto.CategoryResponse;
import com.inventory_sales_hub.app.model.dto.PatchProductParams;
import com.inventory_sales_hub.app.model.dto.ProductParams;
import com.inventory_sales_hub.app.model.dto.ProductResponse;
import com.inventory_sales_hub.app.model.entities.Category;
import com.inventory_sales_hub.app.model.entities.Product;
import com.inventory_sales_hub.app.model.entities.Supplier;
import com.inventory_sales_hub.app.model.persistence.CategoryDao;
import com.inventory_sales_hub.app.model.persistence.ProductDao;
import com.inventory_sales_hub.app.model.persistence.SupplierDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductManager {
    @Autowired private ProductDao productDao;
    @Autowired private CategoryDao categoryDao;
    @Autowired private SupplierDao supplierDao;
    @Autowired private TenantContext tenantContext;

    public List<ProductResponse> getAll() {
        Long tenantId = tenantContext.currentTenantId();
        List<Product> products = tenantId != null
                ? productDao.findAllByActiveTrueAndTenantId(tenantId)
                : productDao.findAllByActiveTrue();
        return products.stream().map(this::toResponse).toList();
    }

    public ProductResponse getById(Long id) {
        Long tenantId = tenantContext.currentTenantId();
        return (tenantId != null
                ? productDao.findByIdAndActiveTrueAndTenantId(id, tenantId)
                : productDao.findByIdAndActiveTrue(id))
                .map(this::toResponse)
                .orElseThrow(() -> new ProductException("Product not found"));
    }

    public List<CategoryResponse> getCategories() {
        Long tenantId = tenantContext.currentTenantId();
        List<Category> categories = tenantId != null
                ? categoryDao.findAllByTenantId(tenantId)
                : categoryDao.findAll();
        return categories.stream().map(this::toCategoryResponse).toList();
    }

    @Transactional
    public ProductResponse create(ProductParams params) {
        Long tenantId = requireTenantId();

        if (params.sku() != null && productDao.existsBySkuAndTenantId(params.sku(), tenantId)) {
            throw new ProductException("A product with this SKU already exists");
        }

        Product product = new Product();
        product.setName(params.name());
        product.setDescription(params.description());
        product.setPurchasePrice(params.purchasePrice());
        product.setSalePrice(params.salePrice());
        product.setSku(params.sku());
        product.setCategory(resolveCategory(params.categoryId(), tenantId));
        product.setSupplier(resolveSupplier(params.supplierId(), tenantId));
        product.setTenantId(tenantId);

        return toResponse(productDao.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductParams params) {
        Long tenantId = requireTenantId();
        Product product = productDao.findByIdAndActiveTrueAndTenantId(id, tenantId)
                .orElseThrow(() -> new ProductException("Product not found"));

        if (params.sku() != null && !params.sku().equals(product.getSku())
                && productDao.existsBySkuAndTenantIdAndIdNot(params.sku(), tenantId, id)) {
            throw new ProductException("A product with this SKU already exists");
        }

        product.setName(params.name());
        product.setDescription(params.description());
        product.setPurchasePrice(params.purchasePrice());
        product.setSalePrice(params.salePrice());
        product.setSku(params.sku());
        product.setCategory(resolveCategory(params.categoryId(), tenantId));
        product.setSupplier(resolveSupplier(params.supplierId(), tenantId));

        return toResponse(productDao.save(product));
    }

    @Transactional
    public ProductResponse patch(Long id, PatchProductParams params) {
        Long tenantId = requireTenantId();
        Product product = productDao.findByIdAndActiveTrueAndTenantId(id, tenantId)
                .orElseThrow(() -> new ProductException("Product not found"));

        if (params.active() != null) product.setActive(params.active());

        return toResponse(productDao.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = requireTenantId();
        if (productDao.findByIdAndActiveTrueAndTenantId(id, tenantId).isEmpty()) {
            throw new ProductException("Product not found");
        }
        productDao.deleteById(id);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryParams params) {
        Long tenantId = requireTenantId();
        if (categoryDao.existsByNameAndTenantId(params.name(), tenantId)) {
            throw new ProductException("A category with this name already exists");
        }
        Category category = new Category();
        category.setName(params.name());
        category.setDescription(params.description());
        category.setTenantId(tenantId);
        return toCategoryResponse(categoryDao.save(category));
    }

    private Long requireTenantId() {
        Long tenantId = tenantContext.currentTenantId();
        if (tenantId == null) throw new ProductException("No tenant context");
        return tenantId;
    }

    private Category resolveCategory(Long categoryId, Long tenantId) {
        if (categoryId == null) return null;
        return categoryDao.findById(categoryId)
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ProductException("Category not found"));
    }

    private Supplier resolveSupplier(Long supplierId, Long tenantId) {
        if (supplierId == null) return null;
        return supplierDao.findById(supplierId)
                .filter(s -> s.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ProductException("Supplier not found"));
    }

    CategoryResponse toCategoryResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription());
    }

    ProductResponse toResponse(Product p) {
        CategoryResponse category = p.getCategory() != null ? toCategoryResponse(p.getCategory()) : null;
        Long supplierId = p.getSupplier() != null ? p.getSupplier().getId() : null;
        String supplierName = p.getSupplier() != null ? p.getSupplier().getName() : null;
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getPurchasePrice(),
                p.getSalePrice(), p.getSku(), category, supplierId, supplierName, p.isActive());
    }
}
