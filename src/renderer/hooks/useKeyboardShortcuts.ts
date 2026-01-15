/**
 * Keyboard Shortcuts Hook
 *
 * Manages global keyboard shortcuts for the application
 */

import { useEffect, useCallback } from 'react';

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: ShortcutHandler[];
}

// Check if the event matches the shortcut
function matchesShortcut(event: KeyboardEvent, shortcut: ShortcutHandler): boolean {
  const key = shortcut.key.toLowerCase();
  const eventKey = event.key.toLowerCase();

  // Check modifier keys
  const ctrlOrMeta = shortcut.ctrl || shortcut.meta;
  const hasCtrlOrMeta = event.ctrlKey || event.metaKey;

  if (ctrlOrMeta && !hasCtrlOrMeta) return false;
  if (!ctrlOrMeta && hasCtrlOrMeta) return false;

  if (shortcut.shift && !event.shiftKey) return false;
  if (!shortcut.shift && event.shiftKey) return false;

  if (shortcut.alt && !event.altKey) return false;
  if (!shortcut.alt && event.altKey) return false;

  // Check key
  return eventKey === key;
}

// Check if we should ignore the shortcut (e.g., when typing in an input)
function shouldIgnoreShortcut(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  const tagName = target.tagName.toLowerCase();

  // Ignore if typing in input, textarea, or contenteditable
  if (tagName === 'input' || tagName === 'textarea') {
    // Allow some shortcuts even in inputs
    if (event.ctrlKey || event.metaKey) {
      const key = event.key.toLowerCase();
      // Allow navigation shortcuts
      if (['s', 'w', 't', 'n', 'o'].includes(key)) {
        return false;
      }
    }
    return true;
  }

  if (target.contentEditable === 'true') {
    return true;
  }

  return false;
}

export function useKeyboardShortcuts({
  enabled = true,
  shortcuts,
}: UseKeyboardShortcutsOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      if (shouldIgnoreShortcut(event)) return;

      for (const shortcut of shortcuts) {
        if (matchesShortcut(event, shortcut)) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.handler();
          return;
        }
      }
    },
    [enabled, shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Predefined common shortcuts
export const COMMON_SHORTCUTS = {
  save: { key: 's', ctrl: true, description: 'Save' },
  newTab: { key: 't', ctrl: true, description: 'New Terminal Tab' },
  newClaudeTab: { key: 'c', ctrl: true, shift: true, description: 'New Claude Tab' },
  newEditor: { key: 'n', ctrl: true, description: 'New Editor' },
  closeTab: { key: 'w', ctrl: true, description: 'Close Tab' },
  openFolder: { key: 'o', ctrl: true, description: 'Open Folder' },
  commandPalette: { key: 'p', ctrl: true, shift: true, description: 'Command Palette' },
  toggleSidebar: { key: 'b', ctrl: true, description: 'Toggle Sidebar' },
  nextTab: { key: 'Tab', ctrl: true, description: 'Next Tab' },
  prevTab: { key: 'Tab', ctrl: true, shift: true, description: 'Previous Tab' },
  find: { key: 'f', ctrl: true, description: 'Find' },
  replace: { key: 'h', ctrl: true, description: 'Find and Replace' },
};

export default useKeyboardShortcuts;
