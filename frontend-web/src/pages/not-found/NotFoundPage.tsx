import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/primitives';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/pages/NotFound.module.scss';

export function NotFoundPage(): React.ReactElement {
    const navigate = useNavigate();

    return (
        <div className={styles['container']}>
            <p className={styles['code']}>404</p>
            <h1 className={styles['title']}>Page not found</h1>
            <p className={styles['message']}>The page you are looking for does not exist.</p>
            <Button onClick={() => { void navigate(APP_ROUTES.DASHBOARD); }}>
                Back to dashboard
            </Button>
        </div>
    );
}
