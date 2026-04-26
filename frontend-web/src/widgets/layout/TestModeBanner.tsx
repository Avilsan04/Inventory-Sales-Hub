import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useViewMode } from '@features/auth/context/ViewModeContext';
import { APP_ROUTES } from '@shared/config/routes';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/TestModeBanner.module.scss';

const CUSTOMER_ROUTES = new Set<string>([
    APP_ROUTES.DASHBOARD,
    APP_ROUTES.SALES,
    APP_ROUTES.PROFILE,
    APP_ROUTES.SETTINGS,
]);

export function TestModeBanner(): React.ReactElement {
    const { translate: t } = useTranslationAdapter();
    const { viewAs, setViewAs } = useViewMode();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const switchToCustomer = React.useCallback((): void => {
        setViewAs('customer');
        if (!CUSTOMER_ROUTES.has(pathname)) {
            void navigate(APP_ROUTES.DASHBOARD, { replace: true });
        }
    }, [setViewAs, navigate, pathname]);

    const switchToAdmin = React.useCallback((): void => {
        setViewAs('admin');
    }, [setViewAs]);

    return (
        <div className={styles['banner']} role="status" aria-live="polite">
            <span className={styles['label']}>
                ⚡ {t('common.testModeBanner')}
            </span>

            <span className={styles['viewingAs']}>
                {t('common.viewingAs')}:
            </span>

            <div className={styles['toggle']}>
                <button
                    type="button"
                    className={cn(styles['toggleBtn'], viewAs === 'admin' && styles['toggleBtnActive'])}
                    onClick={switchToAdmin}
                    disabled={viewAs === 'admin'}
                >
                    🛡️ {t('common.viewAsAdmin')}
                </button>
                <button
                    type="button"
                    className={cn(styles['toggleBtn'], viewAs === 'customer' && styles['toggleBtnActive'])}
                    onClick={switchToCustomer}
                    disabled={viewAs === 'customer'}
                >
                    🛍️ {t('common.viewAsCustomer')}
                </button>
            </div>
        </div>
    );
}
