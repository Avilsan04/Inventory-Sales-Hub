import * as React from 'react';
import { BuildingIcon, CheckCircle2Icon, BanIcon, DollarSignIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useTenants, useActivateTenant, useSuspendTenant, useImpersonation } from '@features/admin';
import { useAdminMetrics } from '@features/admin';
import { toast } from '@shared/hooks/useToast';
import { Spinner } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@shared/ui/composed';
import { TenantTable } from '@features/admin';
import { SectionErrorBoundary } from '@app/providers';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

export function TenantsPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: tenants, isPending, isError } = useTenants();
  const { data: metrics } = useAdminMetrics();
  const { mutate: activate, isPending: isActivating } = useActivateTenant();
  const { mutate: suspend, isPending: isSuspending } = useSuspendTenant();
  const { startImpersonation } = useImpersonation();

  const isMutating = isActivating || isSuspending;

  const handleActivate = (id: string): void => {
    activate(id, {
      onSuccess: () => {
        toast({ title: t('admin.activate') + ' OK' });
      },
      onError: (err) => {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      },
    });
  };

  const handleSuspend = (id: string): void => {
    suspend(id, {
      onSuccess: () => {
        toast({ title: t('admin.suspend') + ' OK' });
      },
      onError: (err) => {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      },
    });
  };

  const handleImpersonate = (id: string): void => {
    void startImpersonation(id);
  };

  if (isPending) {
    return (
      <div className={styles['placeholderContainer']} aria-busy="true">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles['errorContainer']} role="alert">
        <p>{t('common.errorLoadingData')}</p>
      </div>
    );
  }

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div>
          <h1 className={styles['title']}>{t('admin.title')}</h1>
          <p className={styles['subtitle']}>{t('admin.subtitle')}</p>
        </div>
      </header>

      {metrics && (
        <section className={styles['statsRow']} aria-label="Admin metrics">
          <Card>
            <CardHeader>
              <CardTitle className={styles['statTitle']}>
                {t('admin.metrics.totalTenants')}
              </CardTitle>
              <CardAction>
                <BuildingIcon className={styles['statIcon']} aria-hidden="true" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className={styles['statValue']}>{metrics.totalTenants}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className={styles['statTitle']}>
                {t('admin.metrics.activeTenants')}
              </CardTitle>
              <CardAction>
                <CheckCircle2Icon className={styles['statIcon']} aria-hidden="true" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className={styles['statValue']}>{metrics.activeTenants}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className={styles['statTitle']}>
                {t('admin.metrics.suspendedTenants')}
              </CardTitle>
              <CardAction>
                <BanIcon className={styles['statIcon']} aria-hidden="true" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className={styles['statValue']}>{metrics.suspendedTenants}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className={styles['statTitle']}>{t('admin.metrics.mrr')}</CardTitle>
              <CardAction>
                <DollarSignIcon className={styles['statIcon']} aria-hidden="true" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className={styles['statValue']}>
                {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(
                  metrics.totalRevenueMrr
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <section className={styles['content']}>
        <SectionErrorBoundary label="Tenants">
          <Card>
            <CardContent>
              <TenantTable
                tenants={tenants}
                onActivate={handleActivate}
                onSuspend={handleSuspend}
                onImpersonate={handleImpersonate}
                isPending={isMutating}
              />
            </CardContent>
          </Card>
        </SectionErrorBoundary>
      </section>
    </div>
  );
}
