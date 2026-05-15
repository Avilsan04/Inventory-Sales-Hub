package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.model.dto.TenantSettingsParams;
import com.inventory_sales_hub.app.model.dto.TenantSettingsResponse;
import com.inventory_sales_hub.app.model.entities.TenantSettings;
import com.inventory_sales_hub.app.model.persistence.TenantSettingsDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsManager {
    private static final long SINGLETON_ID = 1L;

    @Autowired
    private TenantSettingsDao settingsDao;

    public TenantSettingsResponse getSettings() {
        return settingsDao.findById(SINGLETON_ID)
                .map(this::toResponse)
                .orElseGet(() -> toResponse(createDefaults()));
    }

    @Transactional
    public TenantSettingsResponse updateSettings(TenantSettingsParams params) {
        TenantSettings settings = settingsDao.findById(SINGLETON_ID)
                .orElseGet(this::createDefaults);
        if (params.companyName() != null) settings.setCompanyName(params.companyName());
        if (params.logoUrl() != null) settings.setLogoUrl(params.logoUrl());
        if (params.currency() != null) settings.setCurrency(params.currency());
        if (params.timezone() != null) settings.setTimezone(params.timezone());
        return toResponse(settingsDao.save(settings));
    }

    private TenantSettings createDefaults() {
        TenantSettings s = new TenantSettings();
        return settingsDao.save(s);
    }

    private TenantSettingsResponse toResponse(TenantSettings s) {
        return new TenantSettingsResponse(s.getCompanyName(), s.getLogoUrl(), s.getCurrency(), s.getTimezone());
    }
}
