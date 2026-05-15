import * as React from 'react';
import { ScrollTextIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuditLog } from '@features/audit';
import { Skeleton, Badge, Button } from '@shared/ui/primitives';
import {
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@shared/ui/composed';
import type { BadgeVariant } from '@shared/ui/primitives';
import type { AuditAction } from '@entities/audit';
import { formatDatetimeLocale } from '@shared/lib/formatters';
import pageStyles from '@shared/styles/themes/pages/PageBase.module.scss';
import styles from '@shared/styles/themes/pages/Audit.module.scss';

const PAGE_SIZE = 50;

function actionVariant(action: AuditAction): BadgeVariant {
  const map: Partial<Record<AuditAction, BadgeVariant>> = {
    create: 'success',
    delete: 'destructive',
    adjust_stock: 'warning',
    status_change: 'warning',
  };
  return map[action] ?? 'neutral';
}

export function AuditPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { i18n } = useTranslation();
  const { data: logs, isLoading, isError, refetch } = useAuditLog();

  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  if (isError) {
    return (
      <div className={pageStyles['errorContainer']} role="alert" aria-live="assertive">
        <p>{t('common.errorLoadingData')}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={(): void => {
            void refetch();
          }}
        >
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  const allLogs = logs ?? [];
  const visibleLogs = allLogs.slice(0, visibleCount);
  const hasMore = visibleCount < allLogs.length;

  return (
    <div className={pageStyles['page']}>
      <header className={pageStyles['header']}>
        <div>
          <h1 className={pageStyles['title']}>{t('audit.title')}</h1>
          <p className={pageStyles['subtitle']}>{t('audit.subtitle')}</p>
        </div>
      </header>

      <div className={styles['tableCard']}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('audit.cols.timestamp')}</TableHead>
              <TableHead>{t('audit.cols.user')}</TableHead>
              <TableHead>{t('audit.cols.action')}</TableHead>
              <TableHead>{t('audit.cols.entity')}</TableHead>
              <TableHead>{t('audit.cols.details')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className={pageStyles['skeletonRow']} />
                  </TableCell>
                </TableRow>
              ))
            ) : allLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState icon={<ScrollTextIcon size={24} />} title={t('common.noData')} />
                </TableCell>
              </TableRow>
            ) : (
              visibleLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className={styles['cellMono']}>
                    {formatDatetimeLocale(log.timestamp, i18n.language)}
                  </TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>
                    <Badge variant={actionVariant(log.action)}>
                      {t(`audit.actions.${log.action}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={styles['entityType']}>{log.entityType}</span>{' '}
                    <span className={styles['entityId']}>#{log.entityId.slice(0, 8)}</span>
                  </TableCell>
                  <TableCell className={styles['detailsCell']}>
                    {log.reason != null ? (
                      <span className={styles['detailReason']}>{log.reason}</span>
                    ) : log.after != null ? (
                      <span className={styles['detailDiff']}>{JSON.stringify(log.after)}</span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {hasMore && (
          <div className={styles['loadMoreRow']}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setVisibleCount((c) => c + PAGE_SIZE);
              }}
            >
              {t('audit.loadMore')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
