import * as React from 'react';
import { TrendingUpIcon, ShoppingCartIcon, UsersIcon, PackageIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useDashboardKpi, useTopProducts, useTopCustomers, useLowStockAlerts, useSalesAnalytics } from '@features/analytics';
import { useSaleSummary } from '@features/sales';
import { Spinner, Skeleton } from '@shared/ui/primitives';
import {
    Card, CardHeader, CardTitle, CardAction, CardContent,
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
    RevenueAreaChart, SalesDonutChart, TopProductsBarChart,
    type StatusSlice,
} from '@shared/ui/composed';
import styles from '@shared/styles/themes/pages/Analytics.module.scss';

type KpiIconKey = 'revenue' | 'orders' | 'customers' | 'products';

function renderKpiIcon(key: KpiIconKey): React.ReactElement {
    switch (key) {
        case 'revenue':   return <TrendingUpIcon   aria-hidden="true" />;
        case 'orders':    return <ShoppingCartIcon aria-hidden="true" />;
        case 'customers': return <UsersIcon        aria-hidden="true" />;
        case 'products':  return <PackageIcon      aria-hidden="true" />;
    }
}

export function AnalyticsPage(): React.ReactElement {
    const { translate: t } = useTranslationAdapter();
    const { data: kpi,        isLoading: kpiLoading,     isError: kpiError     } = useDashboardKpi();
    const { data: topProds,   isLoading: prodsLoading,   isError: prodsError   } = useTopProducts();
    const { data: topCusts,   isLoading: custsLoading,   isError: custsError   } = useTopCustomers();
    const { data: alerts,     isLoading: alertsLoading,  isError: alertsError  } = useLowStockAlerts();
    const { data: salesPeriod, isLoading: periodLoading                         } = useSalesAnalytics();
    const { data: saleSummary, isLoading: summaryLoading                        } = useSaleSummary();

    const anyLoading = kpiLoading || prodsLoading || custsLoading || alertsLoading;
    const anyError   = kpiError   || prodsError   || custsError   || alertsError;

    if (anyLoading && !kpi) {
        return (
            <div className={styles['placeholderContainer']} aria-busy="true" aria-live="polite">
                <Spinner size="lg" />
            </div>
        );
    }

    if (anyError && !kpi) {
        return (
            <div className={styles['errorContainer']} role="alert" aria-live="assertive">
                <p>{t('common.errorLoadingData')}</p>
            </div>
        );
    }

    const kpiLoaded = !kpiLoading;

    const kpiCards: Array<{
        key: string;
        titleKey: string;
        value: string | number;
        iconKey: KpiIconKey;
        trend?: string;
    }> = [
        {
            key: 'revenue',
            titleKey: 'analytics.totalRevenue',
            value: kpi ? `${kpi.currency} ${kpi.totalRevenue.toLocaleString()}` : '0',
            iconKey: 'revenue',
            trend: kpi
                ? `${kpi.revenueGrowth >= 0 ? '+' : ''}${String(kpi.revenueGrowth)}%`
                : undefined,
        },
        {
            key: 'orders',
            titleKey: 'analytics.totalOrders',
            value: kpi?.totalOrders ?? 0,
            iconKey: 'orders',
            trend: kpi
                ? `${kpi.ordersGrowth >= 0 ? '+' : ''}${String(kpi.ordersGrowth)}%`
                : undefined,
        },
        {
            key: 'customers',
            titleKey: 'analytics.totalCustomers',
            value: kpi?.totalCustomers ?? 0,
            iconKey: 'customers',
        },
        {
            key: 'products',
            titleKey: 'analytics.totalProducts',
            value: kpi?.totalProducts ?? 0,
            iconKey: 'products',
        },
    ];

    const donutData: StatusSlice[] = saleSummary?.byStatus?.map((b) => ({
        status: b.status,
        count: b.count,
        revenue: b.revenue,
    })) ?? [];

    return (
        <div className={styles['page']}>
            <header className={styles['header']}>
                <h1 className={styles['title']}>{t('analytics.title')}</h1>
                <p className={styles['subtitle']}>{t('analytics.subtitle')}</p>
            </header>

            {/* KPI grid */}
            <section className={styles['kpiGrid']} aria-label="Key performance indicators">
                {kpiCards.map((card) => (
                    <Card key={card.key}>
                        <CardHeader>
                            <CardTitle className={styles['kpiTitle']}>{t(card.titleKey)}</CardTitle>
                            <CardAction>
                                <span className={styles['kpiIcon']}>{renderKpiIcon(card.iconKey)}</span>
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <div className={styles['kpiValue']}>
                                {kpiLoaded ? card.value : <Skeleton className={styles['kpiSkeleton']} />}
                            </div>
                            {kpiLoaded && card.trend !== undefined && (
                                <p className={styles['kpiTrend']}>
                                    {card.trend} {t('analytics.vsLastMonth')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </section>

            {/* Revenue Over Time (full width) */}
            <Card>
                <CardHeader>
                    <div className={styles['chartSection']}>
                        <CardTitle>{t('analytics.revenueOverTime')}</CardTitle>
                        <p className={styles['chartSubtitle']}>{t('analytics.revenueOverTimeSubtitle')}</p>
                    </div>
                    <CardAction>
                        <div className={styles['chartLegend']}>
                            <span className={styles['chartLegendItem']}>
                                <span className={styles['chartLegendDot']} style={{ background: 'var(--color-chart-1)' }} />
                                {t('analytics.revenue')}
                            </span>
                            <span className={styles['chartLegendItem']}>
                                <span className={styles['chartLegendDot']} style={{ background: 'var(--color-chart-2)' }} />
                                {t('analytics.orders')}
                            </span>
                        </div>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <RevenueAreaChart data={salesPeriod} isLoading={periodLoading} />
                </CardContent>
            </Card>

            {/* Sales by Status + Top Products (2-col) */}
            <div className={styles['sectionsGrid']}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.salesByStatus')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SalesDonutChart data={donutData} isLoading={summaryLoading} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.topProductsRevenue')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TopProductsBarChart data={topProds} isLoading={prodsLoading} />
                    </CardContent>
                </Card>
            </div>

            {/* Top Products + Top Customers tables (2-col grid) */}
            <div className={styles['sectionsGrid']}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.topProducts')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('analytics.col.product')}</TableHead>
                                    <TableHead>{t('analytics.col.sku')}</TableHead>
                                    <TableHead>{t('analytics.col.sold')}</TableHead>
                                    <TableHead>{t('analytics.col.revenue')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prodsLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={4}><Skeleton className={styles['skeletonRow']} /></TableCell>
                                        </TableRow>
                                    ))
                                ) : !topProds || topProds.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4}>{t('common.noData')}</TableCell>
                                    </TableRow>
                                ) : (
                                    topProds.map((p) => (
                                        <TableRow key={p.productId}>
                                            <TableCell>{p.productName}</TableCell>
                                            <TableCell>{p.sku}</TableCell>
                                            <TableCell>{p.totalSold}</TableCell>
                                            <TableCell>{kpi?.currency ?? ''} {p.revenue.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.topCustomers')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('analytics.col.customer')}</TableHead>
                                    <TableHead>{t('analytics.col.orders')}</TableHead>
                                    <TableHead>{t('analytics.col.spent')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {custsLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={3}><Skeleton className={styles['skeletonRow']} /></TableCell>
                                        </TableRow>
                                    ))
                                ) : !topCusts || topCusts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3}>{t('common.noData')}</TableCell>
                                    </TableRow>
                                ) : (
                                    topCusts.map((c) => (
                                        <TableRow key={c.customerId}>
                                            <TableCell>{c.customerName}</TableCell>
                                            <TableCell>{c.totalOrders}</TableCell>
                                            <TableCell>{kpi?.currency ?? ''} {c.totalSpent.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Alerts (full width) */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('analytics.lowStockAlerts')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('analytics.col.item')}</TableHead>
                                <TableHead>{t('analytics.col.sku')}</TableHead>
                                <TableHead>{t('analytics.col.qty')}</TableHead>
                                <TableHead>{t('analytics.col.threshold')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alertsLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={4}><Skeleton className={styles['skeletonRow']} /></TableCell>
                                    </TableRow>
                                ))
                            ) : !alerts || alerts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4}>{t('common.noData')}</TableCell>
                                </TableRow>
                            ) : (
                                alerts.map((a) => (
                                    <TableRow key={a.itemId}>
                                        <TableCell>{a.name}</TableCell>
                                        <TableCell>{a.sku}</TableCell>
                                        <TableCell>{a.currentQuantity}</TableCell>
                                        <TableCell>{a.threshold}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
