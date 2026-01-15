/**
 * Monaco Editor Component
 *
 * VSCode-like code editor powered by Monaco
 */

import { useEffect, useRef, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import styles from './MonacoEditor.module.css';

interface MonacoEditorProps {
  /** File content */
  value: string;
  /** Programming language */
  language?: string;
  /** File path for display */
  filePath?: string;
  /** Read-only mode */
  readOnly?: boolean;
  /** Callback when content changes */
  onChange?: (value: string) => void;
  /** Callback when editor is ready */
  onReady?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  /** Callback when save is triggered (Cmd+S) */
  onSave?: (value: string) => void;
}

// Dark theme matching our app
const EDITOR_THEME: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6a6a6a', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'c4b5fd' },
    { token: 'string', foreground: '34d399' },
    { token: 'number', foreground: 'fbbf24' },
    { token: 'type', foreground: '60a5fa' },
    { token: 'function', foreground: 'f472b6' },
    { token: 'variable', foreground: 'eaeaea' },
  ],
  colors: {
    'editor.background': '#0f0f23',
    'editor.foreground': '#eaeaea',
    'editor.lineHighlightBackground': '#1a1a2e',
    'editor.selectionBackground': '#7c3aed50',
    'editor.inactiveSelectionBackground': '#7c3aed30',
    'editorCursor.foreground': '#a78bfa',
    'editorLineNumber.foreground': '#6a6a6a',
    'editorLineNumber.activeForeground': '#a0a0a0',
    'editorIndentGuide.background': '#2a2a4a',
    'editorIndentGuide.activeBackground': '#3a3a5a',
    'editorWidget.background': '#16213e',
    'editorWidget.border': '#2a2a4a',
    'editorSuggestWidget.background': '#16213e',
    'editorSuggestWidget.border': '#2a2a4a',
    'editorSuggestWidget.selectedBackground': '#7c3aed50',
    'scrollbarSlider.background': '#2a2a4a80',
    'scrollbarSlider.hoverBackground': '#3a3a5a',
    'scrollbarSlider.activeBackground': '#4a4a6a',
  },
};

// Detect language from file extension
function detectLanguage(filePath?: string): string {
  if (!filePath) return 'plaintext';

  const ext = filePath.split('.').pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    dockerfile: 'dockerfile',
    makefile: 'makefile',
  };

  return languageMap[ext || ''] || 'plaintext';
}

export function MonacoEditor({
  value,
  language,
  filePath,
  readOnly = false,
  onChange,
  onReady,
  onSave,
}: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const valueRef = useRef(value);

  // Update value ref
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    // Register custom theme
    monaco.editor.defineTheme('vanilla-claude-dark', EDITOR_THEME);

    const editor = monaco.editor.create(containerRef.current, {
      value,
      language: language || detectLanguage(filePath),
      theme: 'vanilla-claude-dark',
      readOnly,
      minimap: { enabled: true, scale: 1 },
      fontSize: 13,
      fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace',
      lineHeight: 20,
      padding: { top: 16, bottom: 16 },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      renderLineHighlight: 'all',
      bracketPairColorization: { enabled: true },
      automaticLayout: true,
      wordWrap: 'on',
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      formatOnType: true,
    });

    editorRef.current = editor;

    // Handle content changes
    editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue();
      if (newValue !== valueRef.current) {
        onChange?.(newValue);
      }
    });

    // Handle save shortcut (Cmd+S / Ctrl+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.(editor.getValue());
    });

    onReady?.(editor);

    return () => {
      editor.dispose();
      editorRef.current = null;
    };
  }, [filePath, readOnly]);

  // Update value when prop changes
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && value !== editor.getValue()) {
      editor.setValue(value);
    }
  }, [value]);

  // Update language when prop changes
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(
          model,
          language || detectLanguage(filePath)
        );
      }
    }
  }, [language, filePath]);

  return (
    <div className={styles.editorContainer}>
      {filePath && (
        <div className={styles.editorHeader}>
          <span className={styles.filePath}>{filePath}</span>
          <span className={styles.language}>
            {language || detectLanguage(filePath)}
          </span>
        </div>
      )}
      <div ref={containerRef} className={styles.editor} />
    </div>
  );
}

export default MonacoEditor;
