import * as React from 'react';
import { SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@shared/ui/composed';
import { cn } from '@shared/lib/cn';
import { useEffectiveRole } from '@features/auth';

import { ROUTE_META } from './routeMeta';
import styles from '@shared/styles/themes/components/TopBar.module.scss';

const isMac = typeof navigator !== 'undefined' && /macintosh|macintel/i.test(navigator.userAgent);

export function CommandPalette(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [activeIdx, setActiveIdx] = React.useState(0);
  const navigate = useNavigate();
  const role = useEffectiveRole();
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
    return items.filter((i) => i.title.toLowerCase().includes(q));
  }, [items, query]);

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
      const t = setTimeout((): void => {
        inputRef.current?.focus();
      }, 10);
      return (): void => {
        clearTimeout(t);
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
      <button
        type="button"
        className={styles['searchTrigger']}
        onClick={() => {
          setOpen(true);
        }}
        aria-label="Abrir buscador (Ctrl K)"
      >
        <SearchIcon className={styles['searchTriggerIcon']} aria-hidden="true" />
        <span className={styles['searchTriggerLabel']}>Buscar...</span>
        <kbd className={styles['kbdHint']}>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
      </button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className={styles['cmdPaletteContent']}>
          <div className={styles['cmdPaletteSearch']}>
            <SearchIcon className={styles['cmdPaletteSearchIcon']} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              className={styles['cmdPaletteInput']}
              placeholder="Buscar páginas..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onKeyDown={onKeyDown}
              aria-label="Buscar páginas"
            />
          </div>
          <div className={styles['cmdPaletteList']} role="listbox">
            {filtered.length === 0 ? (
              <div className={styles['cmdPaletteEmpty']}>Sin resultados</div>
            ) : (
              filtered.map((item, idx) => {
                const { Icon } = item;
                return (
                  <button
                    key={item.route}
                    type="button"
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
                    <span>{item.title}</span>
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
