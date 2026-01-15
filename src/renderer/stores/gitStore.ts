/**
 * Git Store
 *
 * Manages Git repository state using Zustand
 */

import { create } from 'zustand';
import type { GitStatus, GitBranch, FileChange } from '@/types';

interface GitStore {
  // State
  isRepo: boolean;
  currentBranch: string | null;
  branches: GitBranch[];
  status: GitStatus | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setIsRepo: (isRepo: boolean) => void;
  setCurrentBranch: (branch: string) => void;
  setBranches: (branches: GitBranch[]) => void;
  setStatus: (status: GitStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Git operations
  stageFile: (path: string) => void;
  unstageFile: (path: string) => void;
  stageAll: () => void;
  unstageAll: () => void;

  // Reset
  reset: () => void;
}

const initialState = {
  isRepo: false,
  currentBranch: null,
  branches: [],
  status: null,
  isLoading: false,
  error: null,
};

export const useGitStore = create<GitStore>((set, get) => ({
  ...initialState,

  // State setters
  setIsRepo: (isRepo) => set({ isRepo }),

  setCurrentBranch: (branch) => set({ currentBranch: branch }),

  setBranches: (branches) => set({ branches }),

  setStatus: (status) => set({ status }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  // Stage a single file
  stageFile: (path) => {
    const { status } = get();
    if (!status) return;

    const unstagedFile = status.unstaged.find((f) => f.path === path);
    const untrackedIndex = status.untracked.indexOf(path);

    if (unstagedFile) {
      set({
        status: {
          ...status,
          staged: [...status.staged, unstagedFile],
          unstaged: status.unstaged.filter((f) => f.path !== path),
        },
      });
    } else if (untrackedIndex !== -1) {
      const newFile: FileChange = { path, status: 'added' };
      set({
        status: {
          ...status,
          staged: [...status.staged, newFile],
          untracked: status.untracked.filter((p) => p !== path),
        },
      });
    }
  },

  // Unstage a single file
  unstageFile: (path) => {
    const { status } = get();
    if (!status) return;

    const stagedFile = status.staged.find((f) => f.path === path);
    if (!stagedFile) return;

    if (stagedFile.status === 'added') {
      set({
        status: {
          ...status,
          staged: status.staged.filter((f) => f.path !== path),
          untracked: [...status.untracked, path],
        },
      });
    } else {
      set({
        status: {
          ...status,
          staged: status.staged.filter((f) => f.path !== path),
          unstaged: [...status.unstaged, stagedFile],
        },
      });
    }
  },

  // Stage all changes
  stageAll: () => {
    const { status } = get();
    if (!status) return;

    const allStaged = [
      ...status.staged,
      ...status.unstaged,
      ...status.untracked.map((path): FileChange => ({ path, status: 'added' })),
    ];

    set({
      status: {
        staged: allStaged,
        unstaged: [],
        untracked: [],
      },
    });
  },

  // Unstage all changes
  unstageAll: () => {
    const { status } = get();
    if (!status) return;

    const allUnstaged = status.staged.filter((f) => f.status !== 'added');
    const allUntracked = [
      ...status.untracked,
      ...status.staged.filter((f) => f.status === 'added').map((f) => f.path),
    ];

    set({
      status: {
        staged: [],
        unstaged: [...status.unstaged, ...allUnstaged],
        untracked: allUntracked,
      },
    });
  },

  // Reset store
  reset: () => set(initialState),
}));

export default useGitStore;
