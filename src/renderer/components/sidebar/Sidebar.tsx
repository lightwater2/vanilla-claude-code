/**
 * Sidebar Component
 *
 * Navigation sidebar with icons for Files, Git, GitHub, Claude settings
 */

import { useState, useCallback } from 'react';
import styles from './Sidebar.module.css';

type SidebarPanel = 'files' | 'git' | 'github' | 'claude';

interface SidebarProps {
  onPanelChange?: (panel: SidebarPanel | null) => void;
}

const SIDEBAR_ITEMS: {
  id: SidebarPanel;
  icon: string;
  label: string;
}[] = [
  { id: 'files', icon: '📁', label: 'Files' },
  { id: 'git', icon: '⎇', label: 'Git' },
  { id: 'github', icon: '🐙', label: 'GitHub' },
  { id: 'claude', icon: '◈', label: 'Claude' },
];

export function Sidebar({ onPanelChange }: SidebarProps) {
  const [activePanel, setActivePanel] = useState<SidebarPanel | null>('files');

  const handleItemClick = useCallback(
    (panel: SidebarPanel) => {
      const newPanel = activePanel === panel ? null : panel;
      setActivePanel(newPanel);
      onPanelChange?.(newPanel);
    },
    [activePanel, onPanelChange]
  );

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`${styles.item} ${activePanel === item.id ? styles.active : ''}`}
            onClick={() => handleItemClick(item.id)}
            title={item.label}
          >
            <span className={styles.icon}>{item.icon}</span>
          </button>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button className={styles.item} title="Settings">
          <span className={styles.icon}>⚙</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
