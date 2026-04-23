import * as React from 'react';
import { UserCogIcon, CheckCircle2Icon, ShieldCheckIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useEmployees } from '@features/employees';
import { Spinner, Badge } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardAction, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui/composed';
import type { BadgeVariant } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';
import statsStyles from '@shared/styles/themes/pages/Employees.module.scss';

type EmployeeRole = 'admin' | 'manager' | 'staff';

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
  const { data, isLoading, isError } = useEmployees();

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

  const activeCount = data.filter((e) => e.isActive).length;
  const adminCount  = data.filter((e) => e.role === 'admin').length;

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <h1 className={styles['title']}>{t('employees.title')}</h1>
        <p className={styles['subtitle']}>{t('employees.subtitle')}</p>
      </header>

      <section className={statsStyles['statsRow']} aria-label="Employee statistics">
        <Card>
          <CardHeader>
            <CardTitle className={statsStyles['statTitle']}>{t('employees.totalEmployees')}</CardTitle>
            <CardAction>
              <span className={statsStyles['statIcon']}><UserCogIcon aria-hidden="true" /></span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={statsStyles['statValue']}>{data.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={statsStyles['statTitle']}>{t('employees.activeEmployees')}</CardTitle>
            <CardAction>
              <span className={statsStyles['statIcon']}><CheckCircle2Icon aria-hidden="true" /></span>
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
              <span className={statsStyles['statIcon']}><ShieldCheckIcon aria-hidden="true" /></span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={statsStyles['statValue']}>{adminCount}</div>
          </CardContent>
        </Card>
      </section>

      <section className={styles['content']}>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('employees.name')}</TableHead>
                  <TableHead>{t('employees.email')}</TableHead>
                  <TableHead>{t('employees.role')}</TableHead>
                  <TableHead>{t('employees.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className={styles['placeholderContainer']}>
                        <p className={styles['placeholder']}>{t('common.noData')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((e) => (
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
