/**
 * Vanilla Claude Code - Main Application Component
 */

import { useState, useCallback } from 'react';
import { Sidebar } from './components/sidebar';
import { TabBar } from './components/tabs';
import { Terminal } from './components/terminal';
import { MonacoEditor } from './components/editor';
import { GitHubLogin } from './components/github';
import { GitPanel } from './components/git';
import { useAuthStore } from './stores/authStore';
import { useTabStore } from './stores/tabStore';
import { useGitStore } from './stores/gitStore';
import type { TabType } from '@/types';
import './styles/index.css';

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const {
    tabGroups,
    activeGroupId,
    addTab,
    removeTab,
    setActiveTab,
  } = useTabStore();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sampleCode] = useState(`// Welcome to Vanilla Claude Code
// An intuitive IDE for Claude Code CLI

import { claude } from '@anthropic-ai/claude-code';

async function main() {
  const response = await claude.chat({
    message: "Help me write a function",
  });

  console.log(response);
}

main();
`);

  // Get active tab group
  const activeGroup = tabGroups.find((g) => g.id === activeGroupId);
  const activeTab = activeGroup?.tabs.find(
    (t) => t.id === activeGroup.activeTabId
  );

  // Handlers
  const handleAddTab = useCallback(
    (type: TabType) => {
      if (activeGroupId) {
        addTab(activeGroupId, type);
      }
    },
    [activeGroupId, addTab]
  );

  const handleTabClick = useCallback(
    (tabId: string) => {
      if (activeGroupId) {
        setActiveTab(activeGroupId, tabId);
      }
    },
    [activeGroupId, setActiveTab]
  );

  const handleTabClose = useCallback(
    (tabId: string) => {
      if (activeGroupId) {
        removeTab(activeGroupId, tabId);
      }
    },
    [activeGroupId, removeTab]
  );

  const handleLoginClick = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Render tab content based on type
  const renderTabContent = () => {
    if (!activeTab) {
      return (
        <div className="empty-state">
          <p>No tabs open</p>
          <button onClick={() => handleAddTab('claude')}>
            Open Claude Terminal
          </button>
        </div>
      );
    }

    switch (activeTab.type) {
      case 'claude':
        return <Terminal isClaude />;
      case 'terminal':
        return <Terminal />;
      case 'editor':
        return (
          <MonacoEditor
            value={sampleCode}
            filePath={activeTab.data?.filePath || 'untitled.ts'}
            onChange={(value) => console.log('Editor changed:', value.length)}
            onSave={(value) => console.log('Saving:', value.length)}
          />
        );
      case 'git':
        return <GitPanel onFileClick={(path) => console.log('Open file:', path)} />;
      case 'settings':
        return (
          <div className="settings-panel">
            <h3>Settings</h3>
            <p>Settings panel coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-left">
          <h1>Vanilla Claude Code</h1>
        </div>
        <div className="app-header-right">
          {isAuthenticated ? (
            <div className="user-menu">
              <img
                src={user?.avatarUrl}
                alt={user?.login}
                className="avatar"
              />
              <span className="username">{user?.login}</span>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button className="login-button" onClick={handleLoginClick}>
              Connect GitHub
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <div className="content">
          {/* Tab Bar */}
          {activeGroup && (
            <TabBar
              tabs={activeGroup.tabs}
              activeTabId={activeGroup.activeTabId}
              onTabClick={handleTabClick}
              onTabClose={handleTabClose}
              onAddTab={handleAddTab}
            />
          )}

          {/* Tab Content */}
          <div className="tab-content">{renderTabContent()}</div>
        </div>
      </main>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className="quick-action"
          onClick={() => handleAddTab('claude')}
          title="New Claude Tab (Cmd+Shift+C)"
        >
          ◈ Claude
        </button>
        <button
          className="quick-action"
          onClick={() => handleAddTab('terminal')}
          title="New Terminal (Cmd+T)"
        >
          ⌘ Terminal
        </button>
        <button
          className="quick-action"
          onClick={() => handleAddTab('editor')}
          title="New Editor (Cmd+N)"
        >
          📄 Editor
        </button>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <GitHubLogin onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}

export default App;
