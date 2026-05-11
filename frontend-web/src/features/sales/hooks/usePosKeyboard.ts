import * as React from 'react';

interface UsePosKeyboardOptions {
  searchRef: React.RefObject<HTMLInputElement | null>;
  onClearSearch: () => void;
}

function isEditableElement(target: EventTarget | null): boolean {
  const tag = ((target as HTMLElement | null)?.tagName ?? '').toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

function navigatePosCards(direction: 1 | -1, e: KeyboardEvent): void {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-pos-product]'));
  const idx = cards.indexOf(document.activeElement as HTMLElement);
  const next = idx + direction;
  if (direction === 1 && idx !== -1 && next < cards.length) {
    e.preventDefault();
    cards[next]?.focus();
  } else if (direction === -1 && idx > 0) {
    e.preventDefault();
    cards[idx - 1]?.focus();
  }
}

function handleNavigation(e: KeyboardEvent, editable: boolean): void {
  if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && !editable) {
    navigatePosCards(1, e);
  } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && !editable) {
    navigatePosCards(-1, e);
  }
}

function createKeyHandler(
  searchRef: React.RefObject<HTMLInputElement | null>,
  onClearSearch: () => void
): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent): void => {
    const editable = isEditableElement(e.target);

    if (e.key === 'F2') {
      e.preventDefault();
      searchRef.current?.focus();
      return;
    }

    if (e.key === 'Escape' && editable) {
      onClearSearch();
      searchRef.current?.blur();
      return;
    }

    if (e.key === 'ArrowDown' && document.activeElement === searchRef.current) {
      e.preventDefault();
      document.querySelector<HTMLElement>('[data-pos-product]')?.focus();
      return;
    }

    handleNavigation(e, editable);
  };
}

export function usePosKeyboard({ searchRef, onClearSearch }: UsePosKeyboardOptions): void {
  React.useEffect(() => {
    const handler = createKeyHandler(searchRef, onClearSearch);
    window.addEventListener('keydown', handler);
    return (): void => {
      window.removeEventListener('keydown', handler);
    };
  }, [searchRef, onClearSearch]);
}
