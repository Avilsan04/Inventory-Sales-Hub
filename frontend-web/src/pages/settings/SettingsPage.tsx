import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useTheme } from '@shared/hooks/useTheme';
import { useLanguageAdapter } from '@shared/adapters/useLanguageAdapter';
import { useSettings } from '@shared/hooks/useSettings';
import { Switch, Button } from '@shared/ui/primitives';
import {
    Card, CardHeader, CardTitle, CardContent,
    Tabs, TabsList, TabsTrigger, TabsContent,
} from '@shared/ui/composed';
import baseStyles from '@shared/styles/themes/pages/PageBase.module.scss';
import styles from '@shared/styles/themes/pages/Settings.module.scss';

export function SettingsPage(): React.ReactElement {
    const { translate: t } = useTranslationAdapter();
    const { theme, setTheme } = useTheme();
    const { language, toggleLanguage } = useLanguageAdapter();
    const { settings, updateSettings, resetSettings } = useSettings();

    return (
        <div className={baseStyles['page']}>
            <header className={baseStyles['header']}>
                <h1 className={baseStyles['title']}>{t('nav.settings')}</h1>
                <p className={baseStyles['subtitle']}>{t('topbar.subtitle.settings')}</p>
            </header>

            <Tabs defaultValue="appearance">
                <TabsList className={styles['tabsHeader']}>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="language">Language</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>

                <TabsContent value="appearance">
                    <Card>
                        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
                        <CardContent>
                            <div className={styles['fieldRow']}>
                                <div className={styles['labelStack']}>
                                    <span className={styles['labelTitle']}>Dark mode</span>
                                    <span className={styles['labelDesc']}>Switch between light and dark interface</span>
                                </div>
                                <Switch
                                    id="theme-toggle"
                                    checked={theme === 'dark'}
                                    onCheckedChange={(checked: boolean) => { setTheme(checked ? 'dark' : 'light'); }}
                                />
                            </div>
                            <div className={styles['fieldRowLast']}>
                                <div className={styles['labelStack']}>
                                    <span className={styles['labelTitle']}>Current theme</span>
                                    <span className={styles['labelDesc']}>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="language">
                    <Card>
                        <CardHeader><CardTitle>Language</CardTitle></CardHeader>
                        <CardContent>
                            <div className={styles['fieldRowLast']}>
                                <div className={styles['labelStack']}>
                                    <span className={styles['labelTitle']}>{t('common.switchLanguage')}</span>
                                    <span className={styles['labelDesc']}>Current: {language === 'en' ? 'English' : 'Español'}</span>
                                </div>
                                <div className={styles['langButtons']}>
                                    <Button
                                        variant={language === 'en' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => { if (language !== 'en') toggleLanguage(); }}
                                    >
                                        English
                                    </Button>
                                    <Button
                                        variant={language === 'es' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => { if (language !== 'es') toggleLanguage(); }}
                                    >
                                        Español
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader><CardTitle>{t('notifications.title')}</CardTitle></CardHeader>
                        <CardContent>
                            {(
                                [
                                    { key: 'notificationsInfo',    label: 'Info notifications',    desc: 'General informational messages' },
                                    { key: 'notificationsWarning', label: 'Warning notifications', desc: 'Alerts requiring attention' },
                                    { key: 'notificationsError',   label: 'Error notifications',   desc: 'Critical system errors' },
                                    { key: 'notificationsSuccess', label: 'Success notifications', desc: 'Confirmations of completed actions' },
                                ] as const
                            ).map((item, i, arr) => (
                                <div key={item.key} className={i < arr.length - 1 ? styles['fieldRow'] : styles['fieldRowLast']}>
                                    <div className={styles['labelStack']}>
                                        <span className={styles['labelTitle']}>{item.label}</span>
                                        <span className={styles['labelDesc']}>{item.desc}</span>
                                    </div>
                                    <Switch
                                        checked={settings[item.key]}
                                        onCheckedChange={(checked: boolean) => { updateSettings({ [item.key]: checked }); }}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="account">
                    <Card>
                        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
                        <CardContent>
                            <div className={styles['fieldRow']}>
                                <div className={styles['labelStack']}>
                                    <span className={styles['labelTitle']}>Reset preferences</span>
                                    <span className={styles['labelDesc']}>Restore all settings to default values</span>
                                </div>
                                <Button variant="outline" size="sm" onClick={resetSettings}>Reset</Button>
                            </div>
                            <div className={styles['fieldRowLast']}>
                                <div className={styles['labelStack']}>
                                    <span className={styles['labelTitleDanger']}>Delete account</span>
                                    <span className={styles['labelDesc']}>Permanently remove your account and all data</span>
                                </div>
                                <Button variant="destructive" size="sm" disabled>Delete account</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
