import * as React from 'react';

import { LoginForm } from '@features/auth/components/LoginForm';
import { APP_ROUTES } from '@shared/config/routes';
import { useRoutingAdapter } from '@adapters/useRoutingAdapter';
import { useDependencies } from '@shared/hooks/useDependencies';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Spinner } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/Login.module.scss';

interface QuickUser {
    readonly labelKey: string;
    readonly descKey: string;
    readonly email: string;
    readonly password: string;
    readonly icon: string;
}

const QUICK_USERS: readonly QuickUser[] = [
    { labelKey: 'auth.adminLabel',    descKey: 'auth.adminDesc',    email: 'admin@ish.dev',    password: 'Admin.1234',    icon: '🛡️' },
    { labelKey: 'auth.customerLabel', descKey: 'auth.customerDesc', email: 'cliente@ish.dev',  password: 'Cliente.1234',  icon: '🛍️' },
    { labelKey: 'auth.testLabel',     descKey: 'auth.testDesc',     email: 'test@ish.dev',     password: 'Test.1234',     icon: '⚡' },
] as const;

export function LoginPage(): React.ReactElement {
    const { navigateTo } = useRoutingAdapter();
    const { authService } = useDependencies();
    const { translate } = useTranslationAdapter();

    const [loadingIndex, setLoadingIndex] = React.useState<number | null>(null);

    const handleLoginSuccess = React.useCallback((): void => {
        navigateTo(APP_ROUTES.DASHBOARD, true);
    }, [navigateTo]);

    const handleQuickLogin = React.useCallback(
        async (user: QuickUser, index: number): Promise<void> => {
            setLoadingIndex(index);
            try {
                await authService.login({ email: user.email, password: user.password }, false);
                navigateTo(APP_ROUTES.DASHBOARD, true);
            } finally {
                setLoadingIndex(null);
            }
        },
        [authService, navigateTo],
    );

    return (
        <div className={styles['page']}>
            <div className={styles['wideContainer']}>
                <div className={styles['quickAccess']}>
                    <span className={styles['quickAccessTitle']}>
                        {translate('auth.quickAccess')}
                    </span>

                    <div className={styles['accessCards']}>
                        {QUICK_USERS.map((user, i) => (
                            <button
                                key={user.email}
                                type="button"
                                className={styles['accessCard']}
                                onClick={() => { void handleQuickLogin(user, i); }}
                                disabled={loadingIndex !== null}
                            >
                                <span className={styles['accessCardIcon']}>{user.icon}</span>
                                <span className={styles['accessCardRole']}>{translate(user.labelKey)}</span>
                                <span className={styles['accessCardDesc']}>{translate(user.descKey)}</span>
                                <span className={styles['accessCardBtn']}>
                                    {loadingIndex === i
                                        ? <Spinner size="sm" />
                                        : translate('auth.enterAs', { role: translate(user.labelKey) })}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles['divider']}>{translate('auth.orManual')}</div>

                <LoginForm onSuccess={handleLoginSuccess} />
            </div>
        </div>
    );
}
