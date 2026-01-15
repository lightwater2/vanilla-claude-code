/**
 * Terminal Component
 *
 * xterm.js based terminal emulator with fit addon support
 */

import { useEffect, useRef, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import styles from './Terminal.module.css';

interface TerminalProps {
  /** Initial command to run (e.g., 'claude' for Claude tab) */
  initialCommand?: string;
  /** Working directory */
  cwd?: string;
  /** Whether this is a Claude terminal */
  isClaude?: boolean;
  /** Callback when terminal is ready */
  onReady?: (terminal: XTerm) => void;
  /** Callback when terminal data is received */
  onData?: (data: string) => void;
}

const TERMINAL_THEME = {
  background: '#0f0f23',
  foreground: '#eaeaea',
  cursor: '#a78bfa',
  cursorAccent: '#0f0f23',
  selectionBackground: '#7c3aed50',
  black: '#1a1a2e',
  red: '#ef4444',
  green: '#10b981',
  yellow: '#f59e0b',
  blue: '#3b82f6',
  magenta: '#a78bfa',
  cyan: '#06b6d4',
  white: '#eaeaea',
  brightBlack: '#6a6a6a',
  brightRed: '#f87171',
  brightGreen: '#34d399',
  brightYellow: '#fbbf24',
  brightBlue: '#60a5fa',
  brightMagenta: '#c4b5fd',
  brightCyan: '#22d3ee',
  brightWhite: '#ffffff',
};

export function Terminal({
  initialCommand,
  cwd,
  isClaude = false,
  onReady,
  onData,
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const terminal = new XTerm({
      theme: TERMINAL_THEME,
      fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 10000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Handle terminal input
    terminal.onData((data) => {
      onData?.(data);
      // In a real implementation, this would send data to the PTY
      // For now, we'll echo the input
      if (data === '\r') {
        terminal.write('\r\n');
      } else if (data === '\x7f') {
        // Backspace
        terminal.write('\b \b');
      } else {
        terminal.write(data);
      }
    });

    // Write welcome message
    if (isClaude) {
      terminal.writeln('\x1b[1;35m╭─────────────────────────────────────╮\x1b[0m');
      terminal.writeln('\x1b[1;35m│\x1b[0m   \x1b[1;37mVanilla Claude Code\x1b[0m              \x1b[1;35m│\x1b[0m');
      terminal.writeln('\x1b[1;35m│\x1b[0m   \x1b[90mClaude Code CLI Terminal\x1b[0m          \x1b[1;35m│\x1b[0m');
      terminal.writeln('\x1b[1;35m╰─────────────────────────────────────╯\x1b[0m');
      terminal.writeln('');
      terminal.write('\x1b[32m$\x1b[0m ');
    } else {
      terminal.writeln('\x1b[90mTerminal ready.\x1b[0m');
      terminal.writeln('');
      terminal.write('\x1b[32m$\x1b[0m ');
    }

    onReady?.(terminal);

    return () => {
      terminal.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [isClaude, onReady, onData]);

  // Handle resize
  const handleResize = useCallback(() => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Observe container resize
  useEffect(() => {
    if (!terminalRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(terminalRef.current);

    return () => resizeObserver.disconnect();
  }, [handleResize]);

  return (
    <div className={styles.terminalContainer}>
      {isClaude && (
        <div className={styles.claudeBadge}>
          <span className={styles.claudeIcon}>◈</span>
          <span>Claude</span>
        </div>
      )}
      <div ref={terminalRef} className={styles.terminal} />
    </div>
  );
}

export default Terminal;
