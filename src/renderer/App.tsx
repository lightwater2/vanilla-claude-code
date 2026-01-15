/**
 * Vanilla Claude Code - Main Application Component
 */

import { useState } from 'react';
import type { TabGroup, AuthState } from '@/types';

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  const [tabGroups, setTabGroups] = useState<TabGroup[]>([
    {
      id: 'default',
      name: 'Main',
      tabs: [
        {
          id: 'claude-1',
          type: 'claude',
          title: 'Claude',
          active: true,
        },
      ],
      activeTabId: 'claude-1',
    },
  ]);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-left">
          <h1>Vanilla Claude Code</h1>
        </div>
        <div className="app-header-right">
          {authState.isAuthenticated ? (
            <div className="user-info">
              <img
                src={authState.user?.avatarUrl}
                alt={authState.user?.login}
                className="avatar"
              />
              <span>{authState.user?.login}</span>
            </div>
          ) : (
            <button className="login-button">Connect GitHub</button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <button className="sidebar-item active" title="Files">
              Files
            </button>
            <button className="sidebar-item" title="Git">
              Git
            </button>
            <button className="sidebar-item" title="GitHub">
              GitHub
            </button>
            <button className="sidebar-item" title="Claude">
              Claude
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="content">
          {/* Tab Groups */}
          <div className="tab-groups">
            {tabGroups.map((group) => (
              <div key={group.id} className="tab-group">
                {/* Tab Bar */}
                <div className="tab-bar">
                  {group.tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`tab ${tab.active ? 'active' : ''}`}
                    >
                      {tab.title}
                    </button>
                  ))}
                  <button className="tab-add">+</button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                  {group.tabs
                    .filter((tab) => tab.active)
                    .map((tab) => (
                      <div key={tab.id} className="tab-panel">
                        {tab.type === 'claude' && (
                          <div className="claude-terminal">
                            <p>Claude Code CLI will be displayed here</p>
                            <code>$ claude</code>
                          </div>
                        )}
                        {tab.type === 'terminal' && (
                          <div className="terminal">
                            <p>Terminal will be displayed here</p>
                          </div>
                        )}
                        {tab.type === 'editor' && (
                          <div className="editor">
                            <p>Monaco Editor will be displayed here</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
