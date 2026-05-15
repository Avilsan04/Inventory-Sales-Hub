package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.exceptions.CustomerException;
import com.inventory_sales_hub.app.model.dto.CustomerParams;
import com.inventory_sales_hub.app.model.dto.CustomerResponse;
import com.inventory_sales_hub.app.model.dto.PaginatedResponse;
import com.inventory_sales_hub.app.model.entities.Customer;
import com.inventory_sales_hub.app.model.persistence.CustomerDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerManager {
    @Autowired
    private CustomerDao customerDao;

    public List<CustomerResponse> getAll() {
        return customerDao.findAll().stream().map(this::toResponse).toList();
    }

    public PaginatedResponse<CustomerResponse> getAllPaginated(int page, int size, String search) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("name"));
        Page<Customer> p = (search != null && !search.isBlank())
                ? customerDao.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable)
                : customerDao.findAll(pageable);
        List<CustomerResponse> data = p.getContent().stream().map(this::toResponse).toList();
        return new PaginatedResponse<>(data, p.getTotalElements(), page, size);
    }

    public CustomerResponse getById(Long id) {
        return customerDao.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new CustomerException("Customer not found"));
    }

    @Transactional
    public CustomerResponse create(CustomerParams params) {
        if (params.email() != null && customerDao.existsByEmail(params.email())) {
            throw new CustomerException("A customer with this email already exists");
        }
        Customer customer = new Customer();
        customer.setName(params.name());
        customer.setEmail(params.email());
        customer.setPhone(params.phone());
        return toResponse(customerDao.save(customer));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerParams params) {
        Customer customer = customerDao.findById(id)
                .orElseThrow(() -> new CustomerException("Customer not found"));

        if (params.email() != null && !params.email().equals(customer.getEmail())
                && customerDao.existsByEmailAndIdNot(params.email(), id)) {
            throw new CustomerException("A customer with this email already exists");
        }

        customer.setName(params.name());
        customer.setEmail(params.email());
        customer.setPhone(params.phone());
        return toResponse(customerDao.save(customer));
    }

    @Transactional
    public void delete(Long id) {
        if (!customerDao.existsById(id)) throw new CustomerException("Customer not found");
        customerDao.deleteById(id);
    }

    private CustomerResponse toResponse(Customer c) {
        return new CustomerResponse(c.getId(), c.getName(), c.getEmail(), c.getPhone());
    }
}
