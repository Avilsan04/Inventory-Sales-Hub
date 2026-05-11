import type {
  Tenant,
  AdminMetrics,
  ImpersonationToken,
  ActivateTenantDTO,
  SuspendTenantDTO,
} from '@entities/admin';

export interface IAdminApi {
  readonly getTenants: () => Promise<Tenant[]>;
  readonly getMetrics: () => Promise<AdminMetrics>;
  readonly activateTenant: (tenantId: string, data?: ActivateTenantDTO) => Promise<Tenant>;
  readonly suspendTenant: (tenantId: string, data?: SuspendTenantDTO) => Promise<Tenant>;
  readonly getImpersonationToken: (tenantId: string) => Promise<ImpersonationToken>;
}
