/**
 * FileTree Component
 *
 * Displays a hierarchical file browser with expand/collapse functionality
 */

import { useState, useCallback, useEffect } from 'react';
import styles from './FileTree.module.css';

interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  modifiedTime: number;
}

interface FileTreeProps {
  rootPath: string | null;
  onFileSelect?: (path: string) => void;
  onFolderOpen?: () => void;
}

interface TreeNode extends FileEntry {
  children?: TreeNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
}

// File type icons
const FILE_ICONS: Record<string, string> = {
  // Folders
  folder: '📁',
  folderOpen: '📂',

  // Code files
  ts: '🔷',
  tsx: '⚛️',
  js: '🟨',
  jsx: '⚛️',
  py: '🐍',
  go: '🔵',
  rs: '🦀',
  java: '☕',
  rb: '💎',
  php: '🐘',
  swift: '🍎',
  kt: '🟣',

  // Config & data
  json: '📋',
  yaml: '📋',
  yml: '📋',
  toml: '📋',
  xml: '📋',
  env: '🔐',

  // Web
  html: '🌐',
  css: '🎨',
  scss: '🎨',
  less: '🎨',
  svg: '🖼️',

  // Documents
  md: '📝',
  txt: '📄',
  pdf: '📕',
  doc: '📘',

  // Images
  png: '🖼️',
  jpg: '🖼️',
  jpeg: '🖼️',
  gif: '🖼️',
  webp: '🖼️',
  ico: '🖼️',

  // Other
  default: '📄',
  gitignore: '🙈',
  dockerfile: '🐳',
  lock: '🔒',
};

function getFileIcon(name: string, isDirectory: boolean, isExpanded?: boolean): string {
  if (isDirectory) {
    return isExpanded ? FILE_ICONS.folderOpen : FILE_ICONS.folder;
  }

  const ext = name.split('.').pop()?.toLowerCase() || '';
  const baseName = name.toLowerCase();

  // Special files
  if (baseName === '.gitignore') return FILE_ICONS.gitignore;
  if (baseName === 'dockerfile') return FILE_ICONS.dockerfile;
  if (baseName.includes('.lock')) return FILE_ICONS.lock;
  if (baseName === 'claude.md') return '◈';

  return FILE_ICONS[ext] || FILE_ICONS.default;
}

// Sort entries: directories first, then alphabetically
function sortEntries(entries: FileEntry[]): FileEntry[] {
  return [...entries].sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });
}

// Filter hidden files (optional)
function filterHidden(entries: FileEntry[], showHidden: boolean): FileEntry[] {
  if (showHidden) return entries;
  return entries.filter((e) => !e.name.startsWith('.') || e.name === '.claude');
}

export function FileTree({ rootPath, onFileSelect, onFolderOpen }: FileTreeProps) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [showHidden, setShowHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load directory contents
  const loadDirectory = useCallback(async (dirPath: string): Promise<TreeNode[]> => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const entries = await window.electronAPI.fs.readDir(dirPath);
        const filtered = filterHidden(entries, showHidden);
        const sorted = sortEntries(filtered);
        return sorted.map((entry) => ({
          ...entry,
          isExpanded: false,
          children: entry.isDirectory ? undefined : undefined,
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to load directory:', err);
      throw err;
    }
  }, [showHidden]);

  // Load root directory
  useEffect(() => {
    if (!rootPath) {
      setTree([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    loadDirectory(rootPath)
      .then(setTree)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [rootPath, loadDirectory]);

  // Toggle directory expansion
  const toggleDirectory = useCallback(async (node: TreeNode, path: number[]) => {
    const updateNode = (nodes: TreeNode[], pathIndex: number): TreeNode[] => {
      return nodes.map((n, i) => {
        if (i === path[pathIndex]) {
          if (pathIndex === path.length - 1) {
            // This is the target node
            if (n.isExpanded) {
              return { ...n, isExpanded: false };
            }
            return { ...n, isExpanded: true, isLoading: true };
          }
          // Continue down the path
          return {
            ...n,
            children: n.children ? updateNode(n.children, pathIndex + 1) : n.children,
          };
        }
        return n;
      });
    };

    // First, mark as loading and expanded
    setTree((prev) => updateNode(prev, 0));

    // If expanding, load children
    if (!node.isExpanded) {
      try {
        const children = await loadDirectory(node.path);

        const setChildren = (nodes: TreeNode[], pathIndex: number): TreeNode[] => {
          return nodes.map((n, i) => {
            if (i === path[pathIndex]) {
              if (pathIndex === path.length - 1) {
                return { ...n, children, isLoading: false };
              }
              return {
                ...n,
                children: n.children ? setChildren(n.children, pathIndex + 1) : n.children,
              };
            }
            return n;
          });
        };

        setTree((prev) => setChildren(prev, 0));
      } catch (err) {
        console.error('Failed to expand directory:', err);
      }
    }
  }, [loadDirectory]);

  // Handle file click
  const handleFileClick = useCallback((node: TreeNode) => {
    if (node.isFile) {
      onFileSelect?.(node.path);
    }
  }, [onFileSelect]);

  // Render tree node
  const renderNode = (node: TreeNode, path: number[], depth: number) => {
    const icon = getFileIcon(node.name, node.isDirectory, node.isExpanded);
    const indent = depth * 16;

    return (
      <div key={node.path}>
        <div
          className={`${styles.node} ${node.isFile ? styles.file : styles.directory}`}
          style={{ paddingLeft: indent + 8 }}
          onClick={() => {
            if (node.isDirectory) {
              toggleDirectory(node, path);
            } else {
              handleFileClick(node);
            }
          }}
        >
          {node.isDirectory && (
            <span className={styles.chevron}>
              {node.isLoading ? '◌' : node.isExpanded ? '▼' : '▶'}
            </span>
          )}
          <span className={styles.icon}>{icon}</span>
          <span className={styles.name}>{node.name}</span>
        </div>

        {node.isExpanded && node.children && (
          <div className={styles.children}>
            {node.children.map((child, i) =>
              renderNode(child, [...path, i], depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (!rootPath) {
    return (
      <div className={styles.panel}>
        <div className={styles.emptyState}>
          <p>No folder open</p>
          <button className={styles.openButton} onClick={onFolderOpen}>
            Open Folder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>
          {rootPath.split('/').pop() || rootPath}
        </span>
        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={() => setShowHidden(!showHidden)}
            title={showHidden ? 'Hide hidden files' : 'Show hidden files'}
          >
            {showHidden ? '👁' : '👁‍🗨'}
          </button>
          <button
            className={styles.actionButton}
            onClick={() => {
              setIsLoading(true);
              loadDirectory(rootPath)
                .then(setTree)
                .finally(() => setIsLoading(false));
            }}
            title="Refresh"
          >
            ↻
          </button>
        </div>
      </div>

      <div className={styles.tree}>
        {isLoading && tree.length === 0 ? (
          <div className={styles.loading}>Loading...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          tree.map((node, i) => renderNode(node, [i], 0))
        )}
      </div>
    </div>
  );
}

export default FileTree;
