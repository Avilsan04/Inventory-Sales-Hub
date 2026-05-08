import * as React from 'react';
import { UserCogIcon, CheckCircle2Icon, ShieldCheckIcon, PencilIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useEmployees } from '@features/employees';
import { PermissionGuard } from '@features/auth';
import { Spinner, Badge, Button, Pagination } from '@shared/ui/primitives';
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@shared/ui/composed';
import { SectionErrorBoundary } from '@app/providers';
import { EmployeeCreateDialog } from '@features/employees/components/EmployeeCreateDialog';
import { EmployeeEditDialog } from '@features/employees/components/EmployeeEditDialog';
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
  const { data, isPending, isError } = useEmployees();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editEmployee, setEditEmployee] = React.useState<Employee | null>(null);

  const { page, setPage, pageCount, paginated } = useTableFilters<Employee>(
    data,
    () => true,
    EMPLOYEE_PAGE_SIZE
  );

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
      </div>
    );
  }

  const activeCount = data.filter((e) => e.isActive).length;
  const adminCount = data.filter((e) => e.role === 'admin').length;
  const totalEmployees = data.length;
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
            {t('employees.addEmployee')}
          </Button>
        </PermissionGuard>
      </header>

      <section className={statsStyles['statsRow']} aria-label="Employee statistics">
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
                          <Badge variant={roleVariant(e.role as EmployeeRole)}>
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
                              onClick={() => {
                                setEditEmployee(e);
                              }}
                            >
                              <PencilIcon size={14} />
                            </Button>
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
                <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
              </div>
            )}
          </Card>
        </SectionErrorBoundary>
      </section>

      <PermissionGuard permission="view:audit">
        <div className={styles['auditSection']}>
          <h3 className={styles['auditTitle']}>{t('common.auditLog')}</h3>
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
    </div>
  );
}
