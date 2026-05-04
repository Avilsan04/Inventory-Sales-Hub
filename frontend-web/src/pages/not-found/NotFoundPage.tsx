import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button } from '@shared/ui/primitives';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/pages/NotFound.module.scss';

export function NotFoundPage(): React.ReactElement {
  const navigate = useNavigate();
  const { translate } = useTranslationAdapter();

  return (
    <div className={styles['container']}>
      <p className={styles['code']}>404</p>
      <h1 className={styles['title']}>{translate('common.pageNotFound')}</h1>
      <p className={styles['message']}>{translate('common.pageNotFoundDesc')}</p>
      <Button
        onClick={() => {
          void navigate(APP_ROUTES.DASHBOARD);
        }}
      >
        {translate('common.backToDashboard')}
      </Button>
    </div>
  );
}
