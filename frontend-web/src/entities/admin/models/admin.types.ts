export type TenantStatus = 'active' | 'suspended' | 'pending';
export type TenantPlan = 'basic' | 'pro' | 'enterprise';

export interface Tenant {
  id: string;
  name: string;
  plan: TenantPlan;
  status: TenantStatus;
  createdAt: string;
  ownerEmail: string;
  userCount: number;
}

export interface AdminMetrics {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  totalRevenueMrr: number;
}

export interface ImpersonationToken {
  token: string;
  expiresAt: string;
}

export interface ActivateTenantDTO {
  tenantId: string;
}

export interface SuspendTenantDTO {
  tenantId: string;
  reason?: string;
}
