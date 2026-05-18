import * as React from 'react';
import {
  UserCogIcon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useEmployees, useDeleteEmployee } from '@features/employees';
import { PermissionGuard } from '@features/auth';
import { Spinner, Badge, Button, Pagination } from '@shared/ui/primitives';
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  ConfirmDialog,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@shared/ui/composed';
import { SectionErrorBoundary } from '@app/providers';
import { EmployeeCreateDialog } from '@features/employees';
import { EmployeeEditDialog } from '@features/employees';
import { AuditLogPanel } from '@widgets/audit';
import { useTableFilters } from '@shared/hooks';
import type { BadgeVariant } from '@shared/ui/primitives';
import type { Employee } from '@entities/employee';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';
import statsStyles from '@shared/styles/themes/pages/Employees.module.scss';

type EmployeeRole = 'admin' | 'manager' | 'staff';

const EMPLOYEE_PAGE_SIZE = 20;

function roleVariant(role: EmployeeRole): BadgeVariant {
  const map: Record<EmployeeRole, BadgeVariant> = {
    admin: 'default',
    manager: 'secondary',
    staff: 'outline',
  };
  return map[role];
}

export function EmployeesPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isPending, isError, refetch } = useEmployees();
  const deleteEmployee = useDeleteEmployee();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editEmployee, setEditEmployee] = React.useState<Employee | null>(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = React.useState<string | null>(null);

  function handleDelete(): void {
    if (deleteEmployeeId === null) return;
    deleteEmployee.mutate(deleteEmployeeId, {
      onSuccess: () => {
        setDeleteEmployeeId(null);
      },
    });
  }

  const { page, setPage, pageCount, pageSize, setPageSize, paginated } = useTableFilters<Employee>(
    data,
    null,
    EMPLOYEE_PAGE_SIZE
  );

  const activeCount = React.useMemo(() => (data ?? []).filter((e) => e.isActive).length, [data]);
  const adminCount = React.useMemo(
    () => (data ?? []).filter((e) => e.role === 'admin').length,
    [data]
  );
  const totalEmployees = data?.length ?? 0;

  if (isPending) {
    return (
      <div className={styles['placeholderContainer']} aria-busy="true" aria-live="polite">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles['errorContainer']} role="alert" aria-live="assertive">
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

  const employees = paginated;

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div>
          <h1 className={styles['title']}>{t('employees.title')}</h1>
          <p className={styles['subtitle']}>{t('employees.subtitle')}</p>
        </div>
        <PermissionGuard permission="create:employee">
          <Button
            size="sm"
            onClick={() => {
              setCreateOpen(true);
            }}
          >
            <PlusIcon size={14} aria-hidden="true" /> {t('employees.addEmployee')}
          </Button>
        </PermissionGuard>
      </header>

      <section className={statsStyles['statsRow']} aria-label={t('employees.statsAriaLabel')}>
        <Card>
          <CardHeader>
            <CardTitle className={statsStyles['statTitle']}>
              {t('employees.totalEmployees')}
            </CardTitle>
            <CardAction>
              <span className={statsStyles['statIcon']}>
                <UserCogIcon aria-hidden="true" />
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={statsStyles['statValue']}>{totalEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className={statsStyles['statTitle']}>
              {t('employees.activeEmployees')}
            </CardTitle>
            <CardAction>
              <span className={statsStyles['statIcon']}>
                <CheckCircle2Icon aria-hidden="true" />
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={statsStyles['statValue']}>{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className={statsStyles['statTitle']}>{t('employees.adminCount')}</CardTitle>
            <CardAction>
              <span className={statsStyles['statIcon']}>
                <ShieldCheckIcon aria-hidden="true" />
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={statsStyles['statValue']}>{adminCount}</div>
          </CardContent>
        </Card>
      </section>

      <section className={styles['content']}>
        <SectionErrorBoundary label="Employees">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('employees.name')}</TableHead>
                    <TableHead>{t('employees.email')}</TableHead>
                    <TableHead>{t('employees.role')}</TableHead>
                    <TableHead>{t('employees.status')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totalEmployees === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState
                          icon={<UserCogIcon size={24} />}
                          title={t('employees.emptyTitle')}
                          description={t('employees.emptyDescription')}
                          action={{
                            label: t('employees.addEmployee'),
                            onClick: (): void => {
                              setCreateOpen(true);
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.name}</TableCell>
                        <TableCell>{e.email}</TableCell>
                        <TableCell>
                          <Badge variant={roleVariant(e.role)}>
                            {t(`employees.roles.${e.role}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={e.isActive ? 'success' : 'destructive'}>
                            {e.isActive ? t('employees.active') : t('employees.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={styles['cellActions']}>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={t('employees.editEmployee')}
                              onClick={() => {
                                setEditEmployee(e);
                              }}
                            >
                              <PencilIcon size={14} aria-hidden="true" />
                            </Button>
                            <PermissionGuard permission="delete:employee">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={t('employees.deleteEmployee')}
                                onClick={() => {
                                  setDeleteEmployeeId(e.id);
                                }}
                              >
                                <Trash2Icon size={14} aria-hidden="true" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {pageCount > 1 && (
              <div className={styles['tableFooter']}>
                <span>
                  {Math.min((page - 1) * EMPLOYEE_PAGE_SIZE + 1, totalEmployees)}–
                  {Math.min(page * EMPLOYEE_PAGE_SIZE, totalEmployees)} / {totalEmployees}
                </span>
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  onPageChange={setPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                />
              </div>
            )}
          </Card>
        </SectionErrorBoundary>
      </section>

      <PermissionGuard permission="view:audit">
        <div className={styles['auditSection']}>
          <h2 className={styles['auditTitle']}>{t('common.auditLog')}</h2>
          <AuditLogPanel entityType="employee" />
        </div>
      </PermissionGuard>

      <EmployeeCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EmployeeEditDialog
        employee={editEmployee}
        open={editEmployee !== null}
        onOpenChange={(open) => {
          if (!open) setEditEmployee(null);
        }}
      />
      <ConfirmDialog
        open={deleteEmployeeId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteEmployeeId(null);
        }}
        title={t('employees.deleteEmployee')}
        description={t('common.cannotUndo')}
        isPending={deleteEmployee.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
