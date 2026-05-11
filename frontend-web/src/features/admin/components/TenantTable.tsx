import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button, Badge } from '@shared/ui/primitives';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui/composed';
import type { BadgeVariant } from '@shared/ui/primitives';
import type { Tenant, TenantStatus, TenantPlan } from '@entities/admin';

interface TenantTableProps {
  tenants: Tenant[];
  onActivate: (id: string) => void;
  onSuspend: (id: string) => void;
  onImpersonate: (id: string) => void;
  isPending?: boolean;
}

function statusVariant(status: TenantStatus): BadgeVariant {
  const map: Record<TenantStatus, BadgeVariant> = {
    active: 'success',
    suspended: 'destructive',
    pending: 'warning',
  };
  return map[status];
}

function planVariant(plan: TenantPlan): BadgeVariant {
  const map: Record<TenantPlan, BadgeVariant> = {
    enterprise: 'default',
    pro: 'secondary',
    basic: 'outline',
  };
  return map[plan];
}

export function TenantTable({
  tenants,
  onActivate,
  onSuspend,
  onImpersonate,
  isPending = false,
}: TenantTableProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('admin.tenant')}</TableHead>
          <TableHead>{t('admin.plan')}</TableHead>
          <TableHead>{t('admin.status')}</TableHead>
          <TableHead>{t('admin.users')}</TableHead>
          <TableHead>{t('admin.createdAt')}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenants.map((tenant) => (
          <TableRow key={tenant.id}>
            <TableCell>
              <div>
                <div style={{ fontWeight: 500 }}>{tenant.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {tenant.ownerEmail}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={planVariant(tenant.plan)}>{tenant.plan}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant(tenant.status)} showDot>
                {tenant.status}
              </Badge>
            </TableCell>
            <TableCell>{tenant.userCount}</TableCell>
            <TableCell>{new Date(tenant.createdAt).toLocaleDateString('es-ES')}</TableCell>
            <TableCell>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onImpersonate(tenant.id);
                  }}
                  disabled={isPending}
                >
                  {t('admin.impersonate')}
                </Button>
                {tenant.status === 'active' || tenant.status === 'pending' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSuspend(tenant.id);
                    }}
                    disabled={isPending}
                  >
                    {t('admin.suspend')}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onActivate(tenant.id);
                    }}
                    disabled={isPending}
                  >
                    {t('admin.activate')}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
