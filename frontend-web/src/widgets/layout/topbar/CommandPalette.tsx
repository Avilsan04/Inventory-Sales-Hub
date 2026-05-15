import * as React from 'react';
import { SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@shared/ui/composed';
import { Button } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import { useEffectiveRole } from '@features/auth';
import { useTranslationAdapter } from '@shared/adapters/useTranslationAdapter';

import { ROUTE_META } from './routeMeta';
import styles from '@shared/styles/themes/components/TopBar.module.scss';

const isMac = typeof navigator !== 'undefined' && /macintosh|macintel/i.test(navigator.userAgent);

export function CommandPalette(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [activeIdx, setActiveIdx] = React.useState(0);
  const navigate = useNavigate();
  const role = useEffectiveRole();
  const { translate: t } = useTranslationAdapter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const items = React.useMemo(
    () =>
      Object.entries(ROUTE_META)
        .filter(([, meta]) => !meta.roles || (role !== undefined && meta.roles.includes(role)))
        .map(([route, meta]) => ({ route, ...meta })),
    [role]
  );

  const filtered = React.useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((i) => t(i.labelKey).toLowerCase().includes(q));
  }, [items, query, t]);

  React.useEffect((): void => {
    setActiveIdx(0);
  }, [query]);

  React.useEffect((): (() => void) => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return (): void => {
      document.removeEventListener('keydown', handler);
    };
  }, []);

  React.useEffect((): (() => void) | undefined => {
    if (open) {
      const timer = setTimeout((): void => {
        inputRef.current?.focus();
      }, 10);
      return (): void => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [open]);

  const onOpenChange = (val: boolean): void => {
    setOpen(val);
    if (!val) setQuery('');
  };

  const select = (route: string): void => {
    void navigate(route);
    onOpenChange(false);
  };

  const onKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[activeIdx];
      if (item) select(item.route);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className={styles['searchTrigger']}
        onClick={() => {
          setOpen(true);
        }}
        aria-label={`${t('common.search')} (Ctrl K)`}
      >
        <SearchIcon className={styles['searchTriggerIcon']} aria-hidden="true" />
        <span className={styles['searchTriggerLabel']}>{t('common.search')}</span>
        <kbd className={styles['kbdHint']}>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className={styles['cmdPaletteContent']}>
          <div className={styles['cmdPaletteSearch']}>
            <SearchIcon className={styles['cmdPaletteSearchIcon']} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              className={styles['cmdPaletteInput']}
              placeholder={t('common.search')}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onKeyDown={onKeyDown}
              aria-label={t('common.search')}
            />
          </div>
          <div className={styles['cmdPaletteList']} role="listbox">
            {filtered.length === 0 ? (
              <div className={styles['cmdPaletteEmpty']}>{t('common.noData')}</div>
            ) : (
              filtered.map((item, idx) => {
                const { Icon } = item;
                return (
                  <Button
                    key={item.route}
                    variant="ghost"
                    role="option"
                    aria-selected={idx === activeIdx}
                    className={cn(
                      styles['cmdPaletteItem'],
                      idx === activeIdx && styles['cmdPaletteItemActive']
                    )}
                    onClick={() => {
                      select(item.route);
                    }}
                    onMouseEnter={() => {
                      setActiveIdx(idx);
                    }}
                  >
                    <Icon className={styles['cmdPaletteItemIcon']} aria-hidden="true" />
                    <span>{t(item.labelKey)}</span>
                  </Button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
