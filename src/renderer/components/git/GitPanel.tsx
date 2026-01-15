/**
 * Git Panel Component
 *
 * Displays Git status, staged/unstaged changes, and branch info
 */

import { useState, useCallback } from 'react';
import { useGitStore } from '@/renderer/stores/gitStore';
import styles from './GitPanel.module.css';

interface GitPanelProps {
  onFileClick?: (path: string) => void;
}

export function GitPanel({ onFileClick }: GitPanelProps) {
  const {
    isRepo,
    currentBranch,
    status,
    stageFile,
    unstageFile,
    stageAll,
    unstageAll,
  } = useGitStore();

  const [commitMessage, setCommitMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    staged: true,
    unstaged: true,
    untracked: true,
  });

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleCommit = useCallback(() => {
    if (!commitMessage.trim()) return;
    // TODO: Implement commit via IPC
    console.log('Committing:', commitMessage);
    setCommitMessage('');
  }, [commitMessage]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <span className={styles.statusAdded}>A</span>;
      case 'modified':
        return <span className={styles.statusModified}>M</span>;
      case 'deleted':
        return <span className={styles.statusDeleted}>D</span>;
      case 'renamed':
        return <span className={styles.statusRenamed}>R</span>;
      default:
        return <span className={styles.statusUnknown}>?</span>;
    }
  };

  if (!isRepo) {
    return (
      <div className={styles.panel}>
        <div className={styles.emptyState}>
          <p>Not a Git repository</p>
          <button className={styles.initButton}>Initialize Repository</button>
        </div>
      </div>
    );
  }

  // Demo data for visualization
  const demoStatus = status || {
    staged: [
      { path: 'src/App.tsx', status: 'modified' as const },
    ],
    unstaged: [
      { path: 'src/utils.ts', status: 'modified' as const },
      { path: 'src/styles.css', status: 'modified' as const },
    ],
    untracked: ['README.md', 'docs/guide.md'],
  };

  const stagedCount = demoStatus.staged.length;
  const unstagedCount = demoStatus.unstaged.length;
  const untrackedCount = demoStatus.untracked.length;
  const totalChanges = stagedCount + unstagedCount + untrackedCount;

  return (
    <div className={styles.panel}>
      {/* Branch Info */}
      <div className={styles.branchInfo}>
        <span className={styles.branchIcon}>⎇</span>
        <span className={styles.branchName}>{currentBranch || 'main'}</span>
        <span className={styles.changeCount}>{totalChanges} changes</span>
      </div>

      {/* Commit Input */}
      <div className={styles.commitSection}>
        <textarea
          className={styles.commitInput}
          placeholder="Commit message..."
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          rows={3}
        />
        <button
          className={styles.commitButton}
          onClick={handleCommit}
          disabled={!commitMessage.trim() || stagedCount === 0}
        >
          Commit ({stagedCount})
        </button>
      </div>

      {/* Staged Changes */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('staged')}
        >
          <span className={styles.sectionIcon}>
            {expandedSections.staged ? '▼' : '▶'}
          </span>
          <span>Staged Changes</span>
          <span className={styles.sectionCount}>{stagedCount}</span>
          {stagedCount > 0 && (
            <button
              className={styles.sectionAction}
              onClick={(e) => {
                e.stopPropagation();
                unstageAll();
              }}
              title="Unstage All"
            >
              −
            </button>
          )}
        </button>
        {expandedSections.staged && stagedCount > 0 && (
          <ul className={styles.fileList}>
            {demoStatus.staged.map((file) => (
              <li
                key={file.path}
                className={styles.fileItem}
                onClick={() => onFileClick?.(file.path)}
              >
                {getStatusIcon(file.status)}
                <span className={styles.filePath}>{file.path}</span>
                <button
                  className={styles.fileAction}
                  onClick={(e) => {
                    e.stopPropagation();
                    unstageFile(file.path);
                  }}
                  title="Unstage"
                >
                  −
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Unstaged Changes */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('unstaged')}
        >
          <span className={styles.sectionIcon}>
            {expandedSections.unstaged ? '▼' : '▶'}
          </span>
          <span>Changes</span>
          <span className={styles.sectionCount}>{unstagedCount}</span>
          {unstagedCount > 0 && (
            <button
              className={styles.sectionAction}
              onClick={(e) => {
                e.stopPropagation();
                stageAll();
              }}
              title="Stage All"
            >
              +
            </button>
          )}
        </button>
        {expandedSections.unstaged && unstagedCount > 0 && (
          <ul className={styles.fileList}>
            {demoStatus.unstaged.map((file) => (
              <li
                key={file.path}
                className={styles.fileItem}
                onClick={() => onFileClick?.(file.path)}
              >
                {getStatusIcon(file.status)}
                <span className={styles.filePath}>{file.path}</span>
                <button
                  className={styles.fileAction}
                  onClick={(e) => {
                    e.stopPropagation();
                    stageFile(file.path);
                  }}
                  title="Stage"
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Untracked Files */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('untracked')}
        >
          <span className={styles.sectionIcon}>
            {expandedSections.untracked ? '▼' : '▶'}
          </span>
          <span>Untracked</span>
          <span className={styles.sectionCount}>{untrackedCount}</span>
        </button>
        {expandedSections.untracked && untrackedCount > 0 && (
          <ul className={styles.fileList}>
            {demoStatus.untracked.map((path) => (
              <li
                key={path}
                className={styles.fileItem}
                onClick={() => onFileClick?.(path)}
              >
                <span className={styles.statusUntracked}>U</span>
                <span className={styles.filePath}>{path}</span>
                <button
                  className={styles.fileAction}
                  onClick={(e) => {
                    e.stopPropagation();
                    stageFile(path);
                  }}
                  title="Stage"
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default GitPanel;
