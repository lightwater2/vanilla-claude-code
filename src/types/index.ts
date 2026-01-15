/**
 * Core type definitions for Vanilla Claude Code
 */

// GitHub Types
export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatarUrl: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
}

// Git Types
export interface GitStatus {
  staged: FileChange[];
  unstaged: FileChange[];
  untracked: string[];
}

export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  oldPath?: string;
}

export interface GitBranch {
  name: string;
  current: boolean;
  remote?: string;
}

// Tab Types
export type TabType = 'claude' | 'terminal' | 'editor' | 'git' | 'settings';

export interface Tab {
  id: string;
  type: TabType;
  title: string;
  active: boolean;
  data?: TabData;
}

export interface TabData {
  filePath?: string;
  command?: string;
  workingDirectory?: string;
}

export interface TabGroup {
  id: string;
  name: string;
  tabs: Tab[];
  activeTabId: string | null;
}

// Editor Types
export interface EditorState {
  filePath: string;
  content: string;
  language: string;
  isDirty: boolean;
}

// Claude Types
export interface ClaudeConfig {
  userClaude: string | null;
  projectClaude: string | null;
  skills: ClaudeSkill[];
  subAgents: ClaudeSubAgent[];
}

export interface ClaudeSkill {
  name: string;
  description: string;
  enabled: boolean;
}

export interface ClaudeSubAgent {
  name: string;
  type: string;
  description: string;
}

// Auth Types
export interface AuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
}

// Result Type for error handling
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
