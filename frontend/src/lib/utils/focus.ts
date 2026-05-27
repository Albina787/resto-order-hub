/**
 * Утиліти для управління фокусом та клавіатурною навігацією
 */

/**
 * Отримати всі фокусовані елементи в контейнері
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
  );
}

/**
 * Захопити фокус в межах контейнера (для модальних вікон)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Фокус на першому елементі
  firstElement?.focus();

  // Cleanup функція
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Відновити фокус на попередньому елементі
 */
export function createFocusRestore() {
  const previouslyFocused = document.activeElement as HTMLElement;

  return () => {
    previouslyFocused?.focus();
  };
}

/**
 * Перевірити, чи елемент видимий
 */
export function isElementVisible(element: HTMLElement): boolean {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
}

/**
 * Знайти наступний фокусований елемент
 */
export function getNextFocusableElement(
  container: HTMLElement,
  current: HTMLElement,
  direction: 'next' | 'prev' = 'next'
): HTMLElement | null {
  const elements = getFocusableElements(container);
  const currentIndex = elements.indexOf(current);

  if (currentIndex === -1) return null;

  const nextIndex =
    direction === 'next'
      ? (currentIndex + 1) % elements.length
      : (currentIndex - 1 + elements.length) % elements.length;

  return elements[nextIndex] || null;
}
