import { useEffect } from 'react';

type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

/**
 * Hook для обробки клавіатурних скорочень
 * 
 * @example
 * useKeyboardShortcut({ key: 's', ctrl: true }, () => {
 *   console.log('Ctrl+S pressed');
 * });
 */
export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  callback: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrl = false, shift = false, alt = false, meta = false } = shortcut;

      const isMatch =
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt &&
        event.metaKey === meta;

      if (isMatch) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcut, callback, enabled]);
}

/**
 * Hook для обробки Escape клавіші
 */
export function useEscapeKey(callback: () => void, enabled = true) {
  useKeyboardShortcut({ key: 'Escape' }, callback, enabled);
}

/**
 * Hook для обробки Enter клавіші
 */
export function useEnterKey(callback: () => void, enabled = true) {
  useKeyboardShortcut({ key: 'Enter' }, callback, enabled);
}
