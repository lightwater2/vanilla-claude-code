/**
 * TabBar Component
 *
 * Displays tabs with close buttons and add new tab functionality
 */

import { useCallback } from 'react';
import type { Tab, TabType } from '@/types';
import styles from './TabBar.module.css';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onAddTab: (type: TabType) => void;
}

const TAB_ICONS: Record<TabType, string> = {
  claude: '◈',
  terminal: '⌘',
  editor: '📄',
  git: '⎇',
  settings: '⚙',
};

export function TabBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onAddTab,
}: TabBarProps) {
  const handleAddClick = useCallback(() => {
    // Default to terminal tab when clicking +
    onAddTab('terminal');
  }, [onAddTab]);

  const handleTabClose = useCallback(
    (e: React.MouseEvent, tabId: string) => {
      e.stopPropagation();
      onTabClose(tabId);
    },
    [onTabClose]
  );

  return (
    <div className={styles.tabBar}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${tab.id === activeTabId ? styles.active : ''}`}
            onClick={() => onTabClick(tab.id)}
            title={tab.title}
          >
            <span className={styles.tabIcon}>{TAB_ICONS[tab.type]}</span>
            <span className={styles.tabTitle}>{tab.title}</span>
            <button
              className={styles.tabClose}
              onClick={(e) => handleTabClose(e, tab.id)}
              title="Close tab"
            >
              ✕
            </button>
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <div className={styles.addDropdown}>
          <button
            className={styles.addButton}
            onClick={handleAddClick}
            title="New tab"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default TabBar;
