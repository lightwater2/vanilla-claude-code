/**
 * Tab Store
 *
 * Manages tabs and tab groups using Zustand
 */

import { create } from 'zustand';
import type { Tab, TabGroup, TabType } from '@/types';

interface TabStore {
  // State
  tabGroups: TabGroup[];
  activeGroupId: string;

  // Tab Group Actions
  addTabGroup: (name?: string) => string;
  removeTabGroup: (groupId: string) => void;
  setActiveGroup: (groupId: string) => void;
  renameTabGroup: (groupId: string, name: string) => void;

  // Tab Actions
  addTab: (groupId: string, type: TabType, data?: Tab['data']) => string;
  removeTab: (groupId: string, tabId: string) => void;
  setActiveTab: (groupId: string, tabId: string) => void;
  updateTabData: (groupId: string, tabId: string, data: Partial<Tab['data']>) => void;
  moveTab: (fromGroupId: string, toGroupId: string, tabId: string) => void;
}

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Get default title for tab type
const getDefaultTitle = (type: TabType): string => {
  switch (type) {
    case 'claude':
      return 'Claude';
    case 'terminal':
      return 'Terminal';
    case 'editor':
      return 'Editor';
    case 'git':
      return 'Git';
    case 'settings':
      return 'Settings';
    default:
      return 'New Tab';
  }
};

export const useTabStore = create<TabStore>((set, get) => ({
  // Initial state with one default group
  tabGroups: [
    {
      id: 'default',
      name: 'Main',
      tabs: [
        {
          id: 'claude-default',
          type: 'claude',
          title: 'Claude',
          active: true,
        },
      ],
      activeTabId: 'claude-default',
    },
  ],
  activeGroupId: 'default',

  // Tab Group Actions
  addTabGroup: (name) => {
    const id = generateId();
    const newGroup: TabGroup = {
      id,
      name: name || `Group ${get().tabGroups.length + 1}`,
      tabs: [],
      activeTabId: null,
    };

    set((state) => ({
      tabGroups: [...state.tabGroups, newGroup],
      activeGroupId: id,
    }));

    return id;
  },

  removeTabGroup: (groupId) => {
    const { tabGroups, activeGroupId } = get();

    // Don't remove if it's the last group
    if (tabGroups.length <= 1) return;

    const newGroups = tabGroups.filter((g) => g.id !== groupId);
    const newActiveGroupId =
      activeGroupId === groupId ? newGroups[0]?.id || '' : activeGroupId;

    set({
      tabGroups: newGroups,
      activeGroupId: newActiveGroupId,
    });
  },

  setActiveGroup: (groupId) => {
    set({ activeGroupId: groupId });
  },

  renameTabGroup: (groupId, name) => {
    set((state) => ({
      tabGroups: state.tabGroups.map((g) =>
        g.id === groupId ? { ...g, name } : g
      ),
    }));
  },

  // Tab Actions
  addTab: (groupId, type, data) => {
    const tabId = generateId();
    const newTab: Tab = {
      id: tabId,
      type,
      title: data?.filePath?.split('/').pop() || getDefaultTitle(type),
      active: false,
      data,
    };

    set((state) => ({
      tabGroups: state.tabGroups.map((g) => {
        if (g.id !== groupId) return g;

        // Deactivate all existing tabs
        const updatedTabs = g.tabs.map((t) => ({ ...t, active: false }));

        return {
          ...g,
          tabs: [...updatedTabs, { ...newTab, active: true }],
          activeTabId: tabId,
        };
      }),
    }));

    return tabId;
  },

  removeTab: (groupId, tabId) => {
    set((state) => ({
      tabGroups: state.tabGroups.map((g) => {
        if (g.id !== groupId) return g;

        const tabIndex = g.tabs.findIndex((t) => t.id === tabId);
        const newTabs = g.tabs.filter((t) => t.id !== tabId);

        // If removed tab was active, activate adjacent tab
        let newActiveTabId = g.activeTabId;
        if (g.activeTabId === tabId && newTabs.length > 0) {
          const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
          newActiveTabId = newTabs[newActiveIndex].id;
          newTabs[newActiveIndex].active = true;
        } else if (newTabs.length === 0) {
          newActiveTabId = null;
        }

        return {
          ...g,
          tabs: newTabs,
          activeTabId: newActiveTabId,
        };
      }),
    }));
  },

  setActiveTab: (groupId, tabId) => {
    set((state) => ({
      tabGroups: state.tabGroups.map((g) => {
        if (g.id !== groupId) return g;

        return {
          ...g,
          tabs: g.tabs.map((t) => ({
            ...t,
            active: t.id === tabId,
          })),
          activeTabId: tabId,
        };
      }),
    }));
  },

  updateTabData: (groupId, tabId, data) => {
    set((state) => ({
      tabGroups: state.tabGroups.map((g) => {
        if (g.id !== groupId) return g;

        return {
          ...g,
          tabs: g.tabs.map((t) =>
            t.id === tabId ? { ...t, data: { ...t.data, ...data } } : t
          ),
        };
      }),
    }));
  },

  moveTab: (fromGroupId, toGroupId, tabId) => {
    const { tabGroups } = get();

    const fromGroup = tabGroups.find((g) => g.id === fromGroupId);
    const tab = fromGroup?.tabs.find((t) => t.id === tabId);

    if (!tab) return;

    set((state) => ({
      tabGroups: state.tabGroups.map((g) => {
        if (g.id === fromGroupId) {
          // Remove from source group
          const newTabs = g.tabs.filter((t) => t.id !== tabId);
          return {
            ...g,
            tabs: newTabs,
            activeTabId:
              g.activeTabId === tabId
                ? newTabs[0]?.id || null
                : g.activeTabId,
          };
        }

        if (g.id === toGroupId) {
          // Add to target group
          return {
            ...g,
            tabs: [...g.tabs, { ...tab, active: true }],
            activeTabId: tabId,
          };
        }

        return g;
      }),
    }));
  },
}));

export default useTabStore;
