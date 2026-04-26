import * as React from 'react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useCustomers, useDeleteCustomer } from '@features/customers';
import { useTopCustomers } from '@features/analytics';
import { toast } from '@shared/hooks/useToast';
import { Spinner, Button, Input, Avatar, AvatarFallback } from '@shared/ui/primitives';
import {
    Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
    ConfirmDialog,
} from '@shared/ui/composed';
import { CustomerCreateDialog } from '@features/customers/components/CustomerCreateDialog';
import { CustomerEditDialog } from '@features/customers/components/CustomerEditDialog';
import type { Customer } from '@entities/customer';
import styles from '@shared/styles/themes/pages/Customers.module.scss';

function initials(name: string): string {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatEur(amount: number): string {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(amount);
}

export function CustomersPage(): React.ReactElement {
    const { translate: t } = useTranslationAdapter();
    const { data, isLoading, isError } = useCustomers();
    const { data: topCustomers } = useTopCustomers();
    const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();

    const [search, setSearch] = React.useState('');
    const [createOpen, setCreateOpen] = React.useState(false);
    const [editCustomer, setEditCustomer] = React.useState<Customer | null>(null);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);

    const topMap = React.useMemo(() => {
        const map = new Map<string, { totalOrders: number; totalSpent: number }>();
        topCustomers?.forEach((c) => map.set(c.email, { totalOrders: c.totalOrders, totalSpent: c.totalSpent }));
        return map;
    }, [topCustomers]);

    const filtered = React.useMemo(() => {
        if (!data) return [];
        if (!search) return data;
        const q = search.toLowerCase();
        return data.filter(
            (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone ?? '').toLowerCase().includes(q),
        );
    }, [data, search]);

    const handleDelete = (): void => {
        if (deleteId === null) return;
        deleteCustomer(deleteId, {
            onSuccess: () => { toast({ title: 'Customer deleted' }); setDeleteId(null); },
            onError: (err) => { toast({ title: 'Delete failed', description: err.message, variant: 'destructive' }); },
        });
    };

    if (isLoading) {
        return (
            <div className={styles['placeholderContainer']} aria-busy="true" aria-live="polite">
                <Spinner size="lg" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className={styles['errorContainer']} role="alert" aria-live="assertive">
                <p>{t('common.errorLoadingData')}</p>
            </div>
        );
    }

    return (
        <div className={styles['page']}>
            <header className={styles['header']}>
                <div className={styles['headerText']}>
                    <span className={styles['eyebrow']}>PEOPLE</span>
                    <h1 className={styles['title']}>{t('customers.title')}</h1>
                    <p className={styles['subtitle']}>{t('customers.subtitle')}</p>
                </div>
                <Button size="sm" onClick={() => { setCreateOpen(true); }}>{`+ ${t('customers.addCustomer')}`}</Button>
            </header>

            <Card className={styles['tableCard']}>
                <div className={styles['controls']}>
                    <div className={styles['searchBox']}>
                        <Input
                            type="search"
                            placeholder={t('customers.searchPlaceholder')}
                            value={search}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); }}
                            aria-label={t('common.search')}
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('customers.name')}</TableHead>
                            <TableHead>{t('customers.contact')}</TableHead>
                            <TableHead>{t('customers.orders')}</TableHead>
                            <TableHead>{t('customers.lifetimeValue')}</TableHead>
                            <TableHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <div className={styles['placeholderContainer']}><p>{t('common.noData')}</p></div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((c) => {
                                const meta = topMap.get(c.email);
                                return (
                                    <TableRow key={c.id}>
                                        <TableCell>
                                            <div className={styles['customerCell']}>
                                                <Avatar><AvatarFallback>{initials(c.name)}</AvatarFallback></Avatar>
                                                <span className={styles['customerName']}>{c.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className={styles['contactName']}>{c.email}</div>
                                                {c.phone && <div className={styles['contactEmail']}>{c.phone}</div>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {meta ? <span className={styles['metaValue']}>{meta.totalOrders}</span> : <span className={styles['metaMuted']}>—</span>}
                                        </TableCell>
                                        <TableCell>
                                            {meta ? <span className={styles['metaValue']}>{formatEur(meta.totalSpent)}</span> : <span className={styles['metaMuted']}>—</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                                <Button variant="ghost" size="icon-sm" onClick={() => { setEditCustomer(c); }}>
                                                    <PencilIcon size={14} />
                                                </Button>
                                                <Button variant="ghost" size="icon-sm" onClick={() => { setDeleteId(c.id); }}>
                                                    <TrashIcon size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>

            <CustomerCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
            <CustomerEditDialog
                customer={editCustomer}
                open={editCustomer !== null}
                onOpenChange={(open) => { if (!open) setEditCustomer(null); }}
            />
            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => { if (!open) setDeleteId(null); }}
                title="Delete customer?"
                description="This action cannot be undone."
                onConfirm={handleDelete}
                isPending={isDeleting}
            />
        </div>
    );
}
