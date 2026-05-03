package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.exceptions.ProductException;
import com.inventory_sales_hub.app.model.dto.CategoryParams;
import com.inventory_sales_hub.app.model.dto.CategoryResponse;
import com.inventory_sales_hub.app.model.dto.ProductParams;
import com.inventory_sales_hub.app.model.dto.ProductResponse;
import com.inventory_sales_hub.app.model.entities.Category;
import com.inventory_sales_hub.app.model.entities.Product;
import com.inventory_sales_hub.app.model.persistence.CategoryDao;
import com.inventory_sales_hub.app.model.persistence.ProductDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductManager {
    @Autowired
    private ProductDao productDao;

    @Autowired
    private CategoryDao categoryDao;

    public List<ProductResponse> getAll() {
        return productDao.findAll().stream().map(this::toResponse).toList();
    }

    public ProductResponse getById(Long id) {
        return productDao.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ProductException("Product not found"));
    }

    public List<CategoryResponse> getCategories() {
        return categoryDao.findAll().stream().map(this::toCategoryResponse).toList();
    }

    @Transactional
    public ProductResponse create(ProductParams params) {
        if (params.sku() != null && productDao.existsBySku(params.sku())) {
            throw new ProductException("A product with this SKU already exists");
        }

        Category category = resolveCategory(params.categoryId());

        Product product = new Product();
        product.setName(params.name());
        product.setDescription(params.description());
        product.setPrice(params.price());
        product.setSku(params.sku());
        product.setCategory(category);

        return toResponse(productDao.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductParams params) {
        Product product = productDao.findById(id)
                .orElseThrow(() -> new ProductException("Product not found"));

        if (params.sku() != null && !params.sku().equals(product.getSku()) && productDao.existsBySku(params.sku())) {
            throw new ProductException("A product with this SKU already exists");
        }

        product.setName(params.name());
        product.setDescription(params.description());
        product.setPrice(params.price());
        product.setSku(params.sku());
        product.setCategory(resolveCategory(params.categoryId()));

        return toResponse(productDao.save(product));
    }

    @Transactional
    public void delete(Long id) {
        if (!productDao.existsById(id)) throw new ProductException("Product not found");
        productDao.deleteById(id);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryParams params) {
        if (categoryDao.existsByName(params.name())) {
            throw new ProductException("A category with this name already exists");
        }
        Category category = new Category();
        category.setName(params.name());
        category.setDescription(params.description());
        return toCategoryResponse(categoryDao.save(category));
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryDao.findById(categoryId)
                .orElseThrow(() -> new ProductException("Category not found"));
    }

    private CategoryResponse toCategoryResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription());
    }

    private ProductResponse toResponse(Product p) {
        CategoryResponse category = p.getCategory() != null ? toCategoryResponse(p.getCategory()) : null;
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getSku(), category);
    }
}
