package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerDao extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);
}
