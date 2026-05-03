import * as React from 'react';

interface UsePosKeyboardOptions {
  searchRef: React.RefObject<HTMLInputElement | null>;
  onClearSearch: () => void;
}

export function usePosKeyboard({ searchRef, onClearSearch }: UsePosKeyboardOptions): void {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isEditable = tag === 'input' || tag === 'textarea' || tag === 'select';

      if (e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (e.key === 'Escape' && isEditable) {
        onClearSearch();
        searchRef.current?.blur();
        return;
      }

      // ArrowDown from search → focus first product card
      if (e.key === 'ArrowDown' && document.activeElement === searchRef.current) {
        e.preventDefault();
        const first = document.querySelector<HTMLElement>('[data-pos-product]');
        first?.focus();
        return;
      }

      // Arrow navigation between product cards
      if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && !isEditable) {
        const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-pos-product]'));
        const idx = cards.indexOf(document.activeElement as HTMLElement);
        if (idx !== -1 && idx < cards.length - 1) {
          e.preventDefault();
          cards[idx + 1]?.focus();
        }
        return;
      }

      if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && !isEditable) {
        const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-pos-product]'));
        const idx = cards.indexOf(document.activeElement as HTMLElement);
        if (idx > 0) {
          e.preventDefault();
          cards[idx - 1]?.focus();
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return (): void => {
      window.removeEventListener('keydown', handler);
    };
  }, [searchRef, onClearSearch]);
}
