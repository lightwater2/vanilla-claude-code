/**
 * Vanilla Claude Code - Main Process Entry Point
 *
 * This is the Electron main process that handles:
 * - Window management
 * - IPC communication
 * - Native integrations
 * - GitHub OAuth flow
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// GitHub OAuth Handler (Device Flow)
ipcMain.handle('github-device-auth-start', async () => {
  // TODO: Implement GitHub Device Flow
  // 1. Request device code from GitHub
  // 2. Return user code and verification URI
  return {
    userCode: 'XXXX-XXXX',
    verificationUri: 'https://github.com/login/device',
    expiresIn: 900,
  };
});

ipcMain.handle('github-device-auth-poll', async (_event, deviceCode: string) => {
  // TODO: Poll GitHub for access token
  // Return token when user completes authorization
  return {
    accessToken: null,
    error: 'authorization_pending',
  };
});

// Terminal spawn handler
ipcMain.handle('spawn-terminal', async (_event, options: { cwd?: string; command?: string }) => {
  // TODO: Spawn terminal process
  return { success: true, pid: 0 };
});

// Claude CLI handler
ipcMain.handle('spawn-claude', async (_event, options: { cwd?: string }) => {
  // TODO: Spawn claude CLI process
  return { success: true, pid: 0 };
});

export {};
