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
import pageStyles from '@shared/styles/themes/pages/PageBase.module.scss';

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

function formatTimestamp(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function AuditPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { i18n } = useTranslation();
  const { data: logs, isLoading } = useAuditLog();

  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
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

      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-card)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-base)',
        }}
      >
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
                  <TableCell
                    style={{
                      fontFamily: 'var(--font-family-mono)',
                      fontSize: 'var(--font-size-xs)',
                      whiteSpace: 'nowrap',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {formatTimestamp(log.timestamp, i18n.language)}
                  </TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>
                    <Badge variant={actionVariant(log.action)}>
                      {t(`audit.actions.${log.action}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span style={{ textTransform: 'capitalize' }}>{log.entityType}</span>{' '}
                    <span
                      style={{
                        fontFamily: 'var(--font-family-mono)',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      #{log.entityId.slice(0, 8)}
                    </span>
                  </TableCell>
                  <TableCell style={{ maxWidth: '240px' }}>
                    {log.reason != null ? (
                      <span
                        style={{
                          color: 'var(--color-text-secondary)',
                          fontSize: 'var(--font-size-xs)',
                        }}
                      >
                        {log.reason}
                      </span>
                    ) : log.after != null ? (
                      <span
                        style={{
                          fontFamily: 'var(--font-family-mono)',
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                        }}
                      >
                        {JSON.stringify(log.after)}
                      </span>
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: 'var(--spacing-4)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
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
