/**
 * IPC Handlers
 *
 * Handles all IPC communication between main and renderer processes
 */

import {
  ipcMain,
  shell,
  clipboard,
  dialog,
  BrowserWindow,
  app,
} from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';

// Store for terminal instances
const terminals = new Map<string, {
  process: ReturnType<typeof spawn>;
  onData: (data: string) => void;
}>();

let terminalIdCounter = 0;

/**
 * Register all IPC handlers
 */
export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  // ============ App Info ============
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  // ============ Shell ============
  ipcMain.handle('shell:openExternal', async (_event, url: string) => {
    await shell.openExternal(url);
  });

  // ============ Clipboard ============
  ipcMain.handle('clipboard:writeText', (_event, text: string) => {
    clipboard.writeText(text);
  });

  ipcMain.handle('clipboard:readText', () => {
    return clipboard.readText();
  });

  // ============ Window Controls ============
  ipcMain.on('window:minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    mainWindow.close();
  });

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow.isMaximized();
  });

  // Notify renderer when window maximize state changes
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:maximizeChange', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:maximizeChange', false);
  });

  // ============ File System ============
  ipcMain.handle('fs:readDir', async (_event, dirPath: string) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const results = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dirPath, entry.name);
          let stat = { size: 0, mtime: new Date() };
          try {
            stat = await fs.stat(fullPath);
          } catch {
            // Ignore stat errors for inaccessible files
          }
          return {
            name: entry.name,
            path: fullPath,
            isDirectory: entry.isDirectory(),
            isFile: entry.isFile(),
            size: stat.size,
            modifiedTime: stat.mtime.getTime(),
          };
        })
      );
      return results;
    } catch (error) {
      console.error('Failed to read directory:', error);
      throw error;
    }
  });

  ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
    return fs.readFile(filePath, 'utf-8');
  });

  ipcMain.handle(
    'fs:writeFile',
    async (_event, filePath: string, content: string) => {
      await fs.writeFile(filePath, content, 'utf-8');
    }
  );

  ipcMain.handle('fs:exists', async (_event, filePath: string) => {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('fs:mkdir', async (_event, dirPath: string) => {
    await fs.mkdir(dirPath, { recursive: true });
  });

  ipcMain.handle('fs:delete', async (_event, filePath: string) => {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      await fs.rm(filePath, { recursive: true });
    } else {
      await fs.unlink(filePath);
    }
  });

  ipcMain.handle(
    'fs:rename',
    async (_event, oldPath: string, newPath: string) => {
      await fs.rename(oldPath, newPath);
    }
  );

  ipcMain.handle('fs:stat', async (_event, filePath: string) => {
    const stat = await fs.stat(filePath);
    return {
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile(),
      size: stat.size,
      modifiedTime: stat.mtime.getTime(),
    };
  });

  // ============ Dialogs ============
  ipcMain.handle('dialog:showOpen', async (_event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result.canceled ? undefined : result.filePaths;
  });

  ipcMain.handle('dialog:showSave', async (_event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result.canceled ? undefined : result.filePath;
  });

  // ============ Terminal/PTY ============
  ipcMain.handle('terminal:create', async (_event, options: {
    cwd?: string;
    shell?: string;
    args?: string[];
    env?: Record<string, string>;
  }) => {
    const id = `term-${++terminalIdCounter}`;

    // Determine shell based on platform
    const shellPath = options.shell || (
      process.platform === 'win32'
        ? 'powershell.exe'
        : process.env.SHELL || '/bin/zsh'
    );

    const shellArgs = options.args || (
      process.platform === 'win32' ? [] : ['-l']
    );

    const env = {
      ...process.env,
      ...options.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
    };

    // Spawn shell process
    const proc = spawn(shellPath, shellArgs, {
      cwd: options.cwd || process.env.HOME,
      env,
      shell: false,
    });

    // Handle stdout
    proc.stdout?.on('data', (data: Buffer) => {
      mainWindow.webContents.send('terminal:data', id, data.toString());
    });

    // Handle stderr
    proc.stderr?.on('data', (data: Buffer) => {
      mainWindow.webContents.send('terminal:data', id, data.toString());
    });

    // Handle exit
    proc.on('exit', (code) => {
      mainWindow.webContents.send('terminal:exit', id, code || 0);
      terminals.delete(id);
    });

    // Handle error
    proc.on('error', (error) => {
      console.error(`Terminal ${id} error:`, error);
      mainWindow.webContents.send('terminal:data', id, `\r\nError: ${error.message}\r\n`);
    });

    terminals.set(id, {
      process: proc,
      onData: (data) => mainWindow.webContents.send('terminal:data', id, data),
    });

    return { id };
  });

  ipcMain.on('terminal:write', (_event, id: string, data: string) => {
    const terminal = terminals.get(id);
    if (terminal) {
      terminal.process.stdin?.write(data);
    }
  });

  ipcMain.on('terminal:resize', (_event, id: string, cols: number, rows: number) => {
    // Note: Standard spawn doesn't support resize
    // For full PTY support, use node-pty package
    console.log(`Terminal ${id} resize: ${cols}x${rows}`);
  });

  ipcMain.on('terminal:kill', (_event, id: string) => {
    const terminal = terminals.get(id);
    if (terminal) {
      terminal.process.kill();
      terminals.delete(id);
    }
  });

  // ============ Git Operations ============
  ipcMain.handle('git:isRepo', async (_event, dirPath: string) => {
    try {
      await fs.access(path.join(dirPath, '.git'));
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('git:status', async (_event, dirPath: string) => {
    return new Promise((resolve, reject) => {
      const proc = spawn('git', ['status', '--porcelain=v1'], { cwd: dirPath });
      let output = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Git status failed'));
          return;
        }

        const staged: { path: string; status: string }[] = [];
        const unstaged: { path: string; status: string }[] = [];
        const untracked: string[] = [];

        const lines = output.trim().split('\n').filter(Boolean);

        for (const line of lines) {
          const indexStatus = line[0];
          const workingStatus = line[1];
          const filePath = line.slice(3);

          if (indexStatus === '?' && workingStatus === '?') {
            untracked.push(filePath);
          } else {
            if (indexStatus !== ' ' && indexStatus !== '?') {
              staged.push({
                path: filePath,
                status: getStatusName(indexStatus),
              });
            }
            if (workingStatus !== ' ' && workingStatus !== '?') {
              unstaged.push({
                path: filePath,
                status: getStatusName(workingStatus),
              });
            }
          }
        }

        resolve({ staged, unstaged, untracked });
      });

      proc.on('error', reject);
    });
  });

  ipcMain.handle('git:branches', async (_event, dirPath: string) => {
    return new Promise((resolve, reject) => {
      const proc = spawn('git', ['branch', '--list'], { cwd: dirPath });
      let output = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Git branch failed'));
          return;
        }

        const branches = output
          .trim()
          .split('\n')
          .filter(Boolean)
          .map((line) => ({
            name: line.replace(/^\*?\s*/, ''),
            current: line.startsWith('*'),
          }));

        resolve(branches);
      });

      proc.on('error', reject);
    });
  });

  ipcMain.handle('git:currentBranch', async (_event, dirPath: string) => {
    return new Promise((resolve, reject) => {
      const proc = spawn('git', ['branch', '--show-current'], { cwd: dirPath });
      let output = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Git branch failed'));
          return;
        }
        resolve(output.trim());
      });

      proc.on('error', reject);
    });
  });

  ipcMain.handle(
    'git:stage',
    async (_event, dirPath: string, files: string[]) => {
      return new Promise<void>((resolve, reject) => {
        const proc = spawn('git', ['add', ...files], { cwd: dirPath });

        proc.on('close', (code) => {
          if (code !== 0) {
            reject(new Error('Git add failed'));
            return;
          }
          resolve();
        });

        proc.on('error', reject);
      });
    }
  );

  ipcMain.handle(
    'git:unstage',
    async (_event, dirPath: string, files: string[]) => {
      return new Promise<void>((resolve, reject) => {
        const proc = spawn('git', ['reset', 'HEAD', ...files], { cwd: dirPath });

        proc.on('close', (code) => {
          if (code !== 0) {
            reject(new Error('Git reset failed'));
            return;
          }
          resolve();
        });

        proc.on('error', reject);
      });
    }
  );

  ipcMain.handle(
    'git:commit',
    async (_event, dirPath: string, message: string) => {
      return new Promise<void>((resolve, reject) => {
        const proc = spawn('git', ['commit', '-m', message], { cwd: dirPath });

        proc.on('close', (code) => {
          if (code !== 0) {
            reject(new Error('Git commit failed'));
            return;
          }
          resolve();
        });

        proc.on('error', reject);
      });
    }
  );

  ipcMain.handle(
    'git:diff',
    async (_event, dirPath: string, file?: string) => {
      return new Promise((resolve, reject) => {
        const args = file ? ['diff', file] : ['diff'];
        const proc = spawn('git', args, { cwd: dirPath });
        let output = '';

        proc.stdout.on('data', (data) => {
          output += data.toString();
        });

        proc.on('close', (code) => {
          if (code !== 0) {
            reject(new Error('Git diff failed'));
            return;
          }
          resolve(output);
        });

        proc.on('error', reject);
      });
    }
  );

  // ============ GitHub Auth ============
  // These are placeholders - implement with actual OAuth logic
  ipcMain.handle('github:startDeviceAuth', async () => {
    // TODO: Implement actual GitHub Device Flow
    return {
      userCode: 'XXXX-XXXX',
      verificationUri: 'https://github.com/login/device',
      deviceCode: 'mock-device-code',
      expiresIn: 900,
      interval: 5,
    };
  });

  ipcMain.handle('github:pollForToken', async (_event, _deviceCode: string) => {
    // TODO: Implement actual token polling
    return {
      accessToken: null,
      error: 'authorization_pending',
    };
  });

  ipcMain.handle('github:getUser', async (_event, _token: string) => {
    // TODO: Implement actual user fetch
    return {
      id: 0,
      login: 'user',
      name: null,
      avatarUrl: '',
    };
  });

  // ============ Store ============
  const store = new Map<string, unknown>();

  ipcMain.handle('store:get', async (_event, key: string) => {
    return store.get(key);
  });

  ipcMain.handle('store:set', async (_event, key: string, value: unknown) => {
    store.set(key, value);
  });

  ipcMain.handle('store:delete', async (_event, key: string) => {
    store.delete(key);
  });
}

// Helper function to convert git status codes
function getStatusName(code: string): string {
  switch (code) {
    case 'M':
      return 'modified';
    case 'A':
      return 'added';
    case 'D':
      return 'deleted';
    case 'R':
      return 'renamed';
    case 'C':
      return 'copied';
    case 'U':
      return 'unmerged';
    default:
      return 'unknown';
  }
}

export default registerIpcHandlers;
