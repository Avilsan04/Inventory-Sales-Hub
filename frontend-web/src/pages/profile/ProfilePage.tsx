import * as React from 'react';
import { UserIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthMe } from '@features/auth';
import { Spinner } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/composed';
import baseStyles from '@shared/styles/themes/pages/PageBase.module.scss';

type RoleKey = 'admin' | 'manager' | 'staff';

export function ProfilePage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: user, isLoading, isError } = useAuthMe();

  if (isLoading) {
    return (
      <div className={baseStyles['placeholderContainer']} aria-busy="true">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className={baseStyles['errorContainer']} role="alert">
        <p>{t('common.errorLoadingData')}</p>
      </div>
    );
  }

  const roleLabels: Record<RoleKey, string> = {
    admin: t('employees.roles.admin'),
    manager: t('employees.roles.manager'),
    staff: t('employees.roles.staff'),
  };

  return (
    <div className={baseStyles['page']}>
      <header className={baseStyles['header']}>
        <h1 className={baseStyles['title']}>{t('nav.profile')}</h1>
      </header>
      <div className={baseStyles['content']}>
        <Card>
          <CardHeader>
            <CardTitle>
              <UserIcon aria-hidden="true" />
              {user.username}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <dt className={baseStyles['statTitle']}>{t('auth.email')}</dt>
              <dd className={baseStyles['statValue']}>{user.email}</dd>
              <dt className={baseStyles['statTitle']}>{t('common.status')}</dt>
              <dd className={baseStyles['statValue']}>{roleLabels[user.role]}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
