/**
 * Workspace Store
 *
 * Manages workspace state including:
 * - Current project path
 * - Open files
 * - Sidebar panel state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarPanel = 'files' | 'git' | 'github' | 'claude' | null;

interface OpenFile {
  path: string;
  content: string;
  isDirty: boolean;
  language: string;
}

interface WorkspaceStore {
  // State
  projectPath: string | null;
  recentProjects: string[];
  activeSidebarPanel: SidebarPanel;
  openFiles: OpenFile[];
  activeFilePath: string | null;

  // Actions
  setProjectPath: (path: string | null) => void;
  addRecentProject: (path: string) => void;
  removeRecentProject: (path: string) => void;
  setSidebarPanel: (panel: SidebarPanel) => void;

  // File operations
  openFile: (path: string, content: string, language?: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  markFileDirty: (path: string, isDirty: boolean) => void;
  getFile: (path: string) => OpenFile | undefined;

  // Reset
  reset: () => void;
}

const MAX_RECENT_PROJECTS = 10;

const initialState = {
  projectPath: null,
  recentProjects: [],
  activeSidebarPanel: 'files' as SidebarPanel,
  openFiles: [],
  activeFilePath: null,
};

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProjectPath: (path) => {
        set({ projectPath: path });
        if (path) {
          get().addRecentProject(path);
        }
      },

      addRecentProject: (path) => {
        set((state) => {
          const filtered = state.recentProjects.filter((p) => p !== path);
          const updated = [path, ...filtered].slice(0, MAX_RECENT_PROJECTS);
          return { recentProjects: updated };
        });
      },

      removeRecentProject: (path) => {
        set((state) => ({
          recentProjects: state.recentProjects.filter((p) => p !== path),
        }));
      },

      setSidebarPanel: (panel) => {
        set({ activeSidebarPanel: panel });
      },

      openFile: (path, content, language = 'plaintext') => {
        const { openFiles } = get();
        const existing = openFiles.find((f) => f.path === path);

        if (existing) {
          set({ activeFilePath: path });
          return;
        }

        const newFile: OpenFile = {
          path,
          content,
          isDirty: false,
          language,
        };

        set({
          openFiles: [...openFiles, newFile],
          activeFilePath: path,
        });
      },

      closeFile: (path) => {
        const { openFiles, activeFilePath } = get();
        const index = openFiles.findIndex((f) => f.path === path);
        const newFiles = openFiles.filter((f) => f.path !== path);

        let newActivePath = activeFilePath;
        if (activeFilePath === path) {
          if (newFiles.length > 0) {
            const newIndex = Math.min(index, newFiles.length - 1);
            newActivePath = newFiles[newIndex].path;
          } else {
            newActivePath = null;
          }
        }

        set({
          openFiles: newFiles,
          activeFilePath: newActivePath,
        });
      },

      setActiveFile: (path) => {
        set({ activeFilePath: path });
      },

      updateFileContent: (path, content) => {
        set((state) => ({
          openFiles: state.openFiles.map((f) =>
            f.path === path ? { ...f, content, isDirty: true } : f
          ),
        }));
      },

      markFileDirty: (path, isDirty) => {
        set((state) => ({
          openFiles: state.openFiles.map((f) =>
            f.path === path ? { ...f, isDirty } : f
          ),
        }));
      },

      getFile: (path) => {
        return get().openFiles.find((f) => f.path === path);
      },

      reset: () => set(initialState),
    }),
    {
      name: 'vanilla-claude-code-workspace',
      partialize: (state) => ({
        recentProjects: state.recentProjects,
        activeSidebarPanel: state.activeSidebarPanel,
      }),
    }
  )
);

export default useWorkspaceStore;
