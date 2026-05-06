import * as React from 'react';
import { useAuditLog } from '@features/audit';
import { Skeleton, Badge, Input } from '@shared/ui/primitives';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui/composed';
import type { AuditEntityType, AuditAction } from '@entities/audit';
import type { BadgeVariant } from '@shared/ui/primitives';

function actionVariant(action: AuditAction): BadgeVariant {
  const map: Partial<Record<AuditAction, BadgeVariant>> = {
    create: 'success',
    update: 'info',
    delete: 'destructive',
    adjust_stock: 'warning',
    status_change: 'neutral',
  };
  return map[action] ?? 'neutral';
}

function formatTs(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface AuditLogPanelProps {
  entityType?: AuditEntityType;
}

export function AuditLogPanel({ entityType }: AuditLogPanelProps): React.ReactElement {
  const { data, isLoading } = useAuditLog({ entityType });
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(
      (l) =>
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.entityId.toLowerCase().includes(q)
    );
  }, [data, search]);

  return (
    <div>
      <div style={{ marginBottom: '0.75rem' }}>
        <Input
          type="search"
          placeholder="Search by user, action, entity…"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
          }}
          aria-label="Search audit log"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={5}>
                  <Skeleton style={{ height: '1.25rem' }} />
                </TableCell>
              </TableRow>
            ))
          ) : filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                style={{
                  textAlign: 'center',
                  color: 'var(--color-muted-foreground)',
                  padding: '1.5rem',
                }}
              >
                No audit entries
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.userName}</TableCell>
                <TableCell>
                  <Badge variant={actionVariant(log.action)}>{log.action.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell style={{ textTransform: 'capitalize' }}>{log.entityType}</TableCell>
                <TableCell style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {log.entityId.slice(0, 12)}
                </TableCell>
                <TableCell style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                  {formatTs(log.timestamp)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
