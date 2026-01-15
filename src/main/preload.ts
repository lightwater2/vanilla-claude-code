/**
 * Preload Script
 *
 * Exposes secure APIs to the renderer process via contextBridge
 * This runs in an isolated context with access to Node.js APIs
 */

import { contextBridge, ipcRenderer } from 'electron';

// Type definitions for exposed APIs
export interface ElectronAPI {
  // App info
  getAppVersion: () => Promise<string>;
  getPlatform: () => string;

  // GitHub Auth
  github: {
    startDeviceAuth: () => Promise<{
      userCode: string;
      verificationUri: string;
      deviceCode: string;
      expiresIn: number;
      interval: number;
    }>;
    pollForToken: (deviceCode: string) => Promise<{
      accessToken: string | null;
      error?: string;
    }>;
    getUser: (token: string) => Promise<{
      id: number;
      login: string;
      name: string | null;
      avatarUrl: string;
    }>;
    openExternal: (url: string) => void;
  };

  // Terminal/PTY
  terminal: {
    create: (options: {
      cwd?: string;
      shell?: string;
      args?: string[];
      env?: Record<string, string>;
    }) => Promise<{ id: string }>;
    write: (id: string, data: string) => void;
    resize: (id: string, cols: number, rows: number) => void;
    kill: (id: string) => void;
    onData: (callback: (id: string, data: string) => void) => () => void;
    onExit: (callback: (id: string, exitCode: number) => void) => () => void;
  };

  // File System
  fs: {
    readDir: (path: string) => Promise<{
      name: string;
      path: string;
      isDirectory: boolean;
      isFile: boolean;
      size: number;
      modifiedTime: number;
    }[]>;
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    exists: (path: string) => Promise<boolean>;
    mkdir: (path: string) => Promise<void>;
    delete: (path: string) => Promise<void>;
    rename: (oldPath: string, newPath: string) => Promise<void>;
    stat: (path: string) => Promise<{
      isDirectory: boolean;
      isFile: boolean;
      size: number;
      modifiedTime: number;
    }>;
    showOpenDialog: (options: {
      title?: string;
      defaultPath?: string;
      properties?: ('openFile' | 'openDirectory' | 'multiSelections')[];
      filters?: { name: string; extensions: string[] }[];
    }) => Promise<string[] | undefined>;
    showSaveDialog: (options: {
      title?: string;
      defaultPath?: string;
      filters?: { name: string; extensions: string[] }[];
    }) => Promise<string | undefined>;
  };

  // Git Operations
  git: {
    isRepo: (path: string) => Promise<boolean>;
    status: (path: string) => Promise<{
      staged: { path: string; status: string }[];
      unstaged: { path: string; status: string }[];
      untracked: string[];
    }>;
    branches: (path: string) => Promise<{
      name: string;
      current: boolean;
    }[]>;
    currentBranch: (path: string) => Promise<string>;
    stage: (path: string, files: string[]) => Promise<void>;
    unstage: (path: string, files: string[]) => Promise<void>;
    commit: (path: string, message: string) => Promise<void>;
    diff: (path: string, file?: string) => Promise<string>;
  };

  // Clipboard
  clipboard: {
    writeText: (text: string) => void;
    readText: () => string;
  };

  // Window
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
    onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;
  };

  // Store (persistent storage)
  store: {
    get: <T>(key: string) => Promise<T | undefined>;
    set: <T>(key: string, value: T) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
}

// Expose APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => process.platform,

  // GitHub Auth
  github: {
    startDeviceAuth: () => ipcRenderer.invoke('github:startDeviceAuth'),
    pollForToken: (deviceCode: string) =>
      ipcRenderer.invoke('github:pollForToken', deviceCode),
    getUser: (token: string) => ipcRenderer.invoke('github:getUser', token),
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  },

  // Terminal/PTY
  terminal: {
    create: (options) => ipcRenderer.invoke('terminal:create', options),
    write: (id, data) => ipcRenderer.send('terminal:write', id, data),
    resize: (id, cols, rows) => ipcRenderer.send('terminal:resize', id, cols, rows),
    kill: (id) => ipcRenderer.send('terminal:kill', id),
    onData: (callback) => {
      const handler = (_event: Electron.IpcRendererEvent, id: string, data: string) =>
        callback(id, data);
      ipcRenderer.on('terminal:data', handler);
      return () => ipcRenderer.removeListener('terminal:data', handler);
    },
    onExit: (callback) => {
      const handler = (_event: Electron.IpcRendererEvent, id: string, exitCode: number) =>
        callback(id, exitCode);
      ipcRenderer.on('terminal:exit', handler);
      return () => ipcRenderer.removeListener('terminal:exit', handler);
    },
  },

  // File System
  fs: {
    readDir: (path) => ipcRenderer.invoke('fs:readDir', path),
    readFile: (path) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path, content) => ipcRenderer.invoke('fs:writeFile', path, content),
    exists: (path) => ipcRenderer.invoke('fs:exists', path),
    mkdir: (path) => ipcRenderer.invoke('fs:mkdir', path),
    delete: (path) => ipcRenderer.invoke('fs:delete', path),
    rename: (oldPath, newPath) => ipcRenderer.invoke('fs:rename', oldPath, newPath),
    stat: (path) => ipcRenderer.invoke('fs:stat', path),
    showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpen', options),
    showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSave', options),
  },

  // Git Operations
  git: {
    isRepo: (path) => ipcRenderer.invoke('git:isRepo', path),
    status: (path) => ipcRenderer.invoke('git:status', path),
    branches: (path) => ipcRenderer.invoke('git:branches', path),
    currentBranch: (path) => ipcRenderer.invoke('git:currentBranch', path),
    stage: (path, files) => ipcRenderer.invoke('git:stage', path, files),
    unstage: (path, files) => ipcRenderer.invoke('git:unstage', path, files),
    commit: (path, message) => ipcRenderer.invoke('git:commit', path, message),
    diff: (path, file) => ipcRenderer.invoke('git:diff', path, file),
  },

  // Clipboard
  clipboard: {
    writeText: (text) => ipcRenderer.invoke('clipboard:writeText', text),
    readText: () => ipcRenderer.invoke('clipboard:readText'),
  },

  // Window
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximizeChange: (callback) => {
      const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean) =>
        callback(isMaximized);
      ipcRenderer.on('window:maximizeChange', handler);
      return () => ipcRenderer.removeListener('window:maximizeChange', handler);
    },
  },

  // Store
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
    delete: (key) => ipcRenderer.invoke('store:delete', key),
  },
} as ElectronAPI);

// Type augmentation for window object
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
