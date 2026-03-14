import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@shared/ui/composed/Table';
import { Badge } from '@shared/ui/primitives';
import type { InventoryItem } from '@entities/inventory';
import styles from '@shared/styles/themes/widgets/InventoryTable.module.scss';

interface InventoryTableWidgetProps {
    data: InventoryItem[];
}

const getStatusBadgeVariant = (
    status: InventoryItem['status']
): 'success' | 'secondary' | 'destructive' | 'default' => {
    switch (status) {
        case 'IN_STOCK': return 'success';
        case 'LOW_STOCK': return 'secondary';
        case 'OUT_OF_STOCK': return 'destructive';
        default: return 'default';
    }
};

const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
};

export function InventoryTableWidget({ data }: InventoryTableWidgetProps): React.ReactElement {
    const { t } = useTranslation();

    return (
        <div className={styles.tableWrapper}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('inventory.sku', 'SKU')}</TableHead>
                        <TableHead>{t('inventory.name', 'Product Name')}</TableHead>
                        <TableHead className={styles.priceCell}>{t('inventory.price', 'Price')}</TableHead>
                        <TableHead className={styles.quantityCell}>{t('inventory.quantity', 'Stock')}</TableHead>
                        <TableHead>{t('inventory.status', 'Status')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className={styles.skuCell}>{item.sku}</TableCell>
                            <TableCell className={styles.nameCell}>{item.name}</TableCell>
                            <TableCell className={styles.priceCell}>{formatCurrency(item.price, item.currency)}</TableCell>
                            <TableCell className={styles.quantityCell}>{item.quantity}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(item.status)}>
                                    {t(`inventory.status_${item.status}`, item.status.replace(/_/g, ' '))}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
