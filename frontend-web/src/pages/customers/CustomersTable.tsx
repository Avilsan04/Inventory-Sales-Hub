import * as React from 'react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { initials, formatCurrency } from '@shared/lib';
import { Button, Avatar, AvatarFallback } from '@shared/ui/primitives';
import { TableRow, TableCell } from '@shared/ui/composed';
import type { Customer } from '@entities/customer';
import pageStyles from '@shared/styles/themes/pages/PageBase.module.scss';
import styles from '@shared/styles/themes/pages/Customers.module.scss';

export interface CustomerRowProps {
  customer: Customer;
  topMeta: { totalOrders: number; totalSpent: number } | undefined;
  onEdit: (c: Customer) => void;
  onDelete: (id: string) => void;
}

export function CustomerTableRow({
  customer: c,
  topMeta: meta,
  onEdit,
  onDelete,
}: CustomerRowProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  return (
    <TableRow>
      <TableCell>
        <div className={styles['customerCell']}>
          <Avatar>
            <AvatarFallback>{initials(c.name)}</AvatarFallback>
          </Avatar>
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
        {meta ? (
          <span className={styles['metaValue']}>{meta.totalOrders}</span>
        ) : (
          <span className={styles['metaMuted']}>—</span>
        )}
      </TableCell>
      <TableCell>
        {meta ? (
          <span className={styles['metaValue']}>{formatCurrency(meta.totalSpent, 'EUR')}</span>
        ) : (
          <span className={styles['metaMuted']}>—</span>
        )}
      </TableCell>
      <TableCell>
        <div className={pageStyles['cellActions']}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('customers.editCustomer')}
            onClick={(): void => {
              onEdit(c);
            }}
          >
            <PencilIcon size={14} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('customers.deleteCustomer')}
            onClick={(): void => {
              onDelete(c.id);
            }}
          >
            <TrashIcon size={14} aria-hidden="true" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
