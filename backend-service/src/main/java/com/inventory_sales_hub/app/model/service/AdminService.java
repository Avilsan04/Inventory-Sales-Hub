package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.model.dto.AdminMetricsResponse;
import com.inventory_sales_hub.app.model.dto.ImpersonationTokenResponse;
import com.inventory_sales_hub.app.model.dto.TenantResponse;
import com.inventory_sales_hub.app.model.entities.Tenant;
import com.inventory_sales_hub.app.model.entities.TenantStatus;
import com.inventory_sales_hub.app.model.persistence.TenantDao;
import com.inventory_sales_hub.app.model.persistence.UserDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AdminService {

    @Autowired private TenantDao tenantDao;
    @Autowired private UserDao userDao;
    @Autowired private JwtManager jwtManager;

    public List<TenantResponse> getTenants() {
        int userCount = (int) userDao.count();
        return tenantDao.findAll().stream()
                .map(t -> toResponse(t, userCount))
                .toList();
    }

    public AdminMetricsResponse getMetrics() {
        long total = tenantDao.count();
        long active = tenantDao.countByStatus(TenantStatus.ACTIVE);
        long suspended = tenantDao.countByStatus(TenantStatus.SUSPENDED);
        return new AdminMetricsResponse(total, active, suspended, 0L);
    }

    @Transactional
    public TenantResponse activate(Long id) {
        Tenant tenant = tenantDao.findById(id).orElseThrow(() -> new RuntimeException("Tenant not found"));
        tenant.setStatus(TenantStatus.ACTIVE);
        return toResponse(tenantDao.save(tenant), (int) userDao.count());
    }

    @Transactional
    public TenantResponse suspend(Long id) {
        Tenant tenant = tenantDao.findById(id).orElseThrow(() -> new RuntimeException("Tenant not found"));
        tenant.setStatus(TenantStatus.SUSPENDED);
        return toResponse(tenantDao.save(tenant), (int) userDao.count());
    }

    public ImpersonationTokenResponse impersonate(Long tenantId) {
        String token = jwtManager.generateToken("impersonated-" + tenantId, tenantId, "ADMIN");
        String expiresAt = Instant.now().plus(1, ChronoUnit.HOURS).toString();
        return new ImpersonationTokenResponse(token, expiresAt);
    }

    private TenantResponse toResponse(Tenant t, int userCount) {
        return new TenantResponse(
                String.valueOf(t.getId()),
                t.getName(),
                t.getPlan().name().toLowerCase(),
                t.getStatus().name().toLowerCase(),
                t.getCreatedAt().toString(),
                t.getOwnerEmail(),
                userCount
        );
    }
}
