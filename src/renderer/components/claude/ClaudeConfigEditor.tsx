/**
 * Claude Config Editor Component
 *
 * Visual editor for CLAUDE.md files with sections for:
 * - Project overview
 * - Coding conventions
 * - Skills configuration
 * - Sub-agent definitions
 */

import { useState, useCallback, useEffect } from 'react';
import styles from './ClaudeConfigEditor.module.css';

interface ClaudeConfigEditorProps {
  userClaudePath?: string;
  projectClaudePath?: string;
  onSave?: (content: string, isUser: boolean) => void;
}

interface Section {
  id: string;
  title: string;
  icon: string;
  content: string;
  isExpanded: boolean;
}

const DEFAULT_SECTIONS: Section[] = [
  {
    id: 'overview',
    title: 'Project Overview',
    icon: '📋',
    content: `## Project Overview

**Project Name**: Your Project
**Description**: A brief description of your project

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript |
| Backend | Node.js |
| Database | PostgreSQL |
`,
    isExpanded: true,
  },
  {
    id: 'conventions',
    title: 'Coding Conventions',
    icon: '📝',
    content: `## Naming Conventions

- Variables: camelCase
- Functions: camelCase
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case or camelCase

## Code Style

- Use TypeScript strict mode
- Prefer functional components
- Use async/await over promises
- Keep functions under 50 lines
`,
    isExpanded: false,
  },
  {
    id: 'git',
    title: 'Git Workflow',
    icon: '⎇',
    content: `## Branch Strategy

- main: Production releases
- develop: Development integration
- feature/*: New features
- bugfix/*: Bug fixes

## Commit Format

\`\`\`
[YYMMDD-XXX-TYPE] Message

- Detail 1
- Detail 2
\`\`\`
`,
    isExpanded: false,
  },
  {
    id: 'skills',
    title: 'Claude Skills',
    icon: '⚡',
    content: `## Custom Skills

Add your custom skills here.

### Example Skill

\`\`\`yaml
name: my-skill
description: Description of the skill
trigger: /my-skill
\`\`\`
`,
    isExpanded: false,
  },
  {
    id: 'agents',
    title: 'Sub-Agents',
    icon: '🤖',
    content: `## Sub-Agent Definitions

Define your custom sub-agents here.

### Example Agent

\`\`\`yaml
name: test-runner
description: Runs tests after code changes
tools: [Bash]
\`\`\`
`,
    isExpanded: false,
  },
];

export function ClaudeConfigEditor({
  userClaudePath,
  projectClaudePath,
  onSave,
}: ClaudeConfigEditorProps) {
  const [activeTab, setActiveTab] = useState<'project' | 'user'>('project');
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
      )
    );
  }, []);

  // Start editing section
  const startEditing = useCallback((section: Section) => {
    setEditingSection(section.id);
    setEditContent(section.content);
  }, []);

  // Save section edit
  const saveEdit = useCallback(() => {
    if (!editingSection) return;

    setSections((prev) =>
      prev.map((s) =>
        s.id === editingSection ? { ...s, content: editContent } : s
      )
    );
    setEditingSection(null);
    setIsDirty(true);
  }, [editingSection, editContent]);

  // Cancel edit
  const cancelEdit = useCallback(() => {
    setEditingSection(null);
    setEditContent('');
  }, []);

  // Generate full CLAUDE.md content
  const generateContent = useCallback(() => {
    return sections
      .map((s) => `# ${s.title}\n\n${s.content}`)
      .join('\n\n---\n\n');
  }, [sections]);

  // Save to file
  const handleSave = useCallback(() => {
    const content = generateContent();
    onSave?.(content, activeTab === 'user');
    setIsDirty(false);
  }, [generateContent, onSave, activeTab]);

  // Add new section
  const addSection = useCallback(() => {
    const newSection: Section = {
      id: `custom-${Date.now()}`,
      title: 'New Section',
      icon: '📌',
      content: '## New Section\n\nAdd your content here.',
      isExpanded: true,
    };
    setSections((prev) => [...prev, newSection]);
    setIsDirty(true);
  }, []);

  // Remove section
  const removeSection = useCallback((sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    setIsDirty(true);
  }, []);

  return (
    <div className={styles.editor}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'project' ? styles.active : ''}`}
            onClick={() => setActiveTab('project')}
          >
            📁 Project CLAUDE.md
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'user' ? styles.active : ''}`}
            onClick={() => setActiveTab('user')}
          >
            👤 User CLAUDE.md
          </button>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.addButton}
            onClick={addSection}
            title="Add Section"
          >
            + Add Section
          </button>
          <button
            className={`${styles.saveButton} ${isDirty ? styles.dirty : ''}`}
            onClick={handleSave}
            disabled={!isDirty}
          >
            {isDirty ? '● Save Changes' : 'Saved'}
          </button>
        </div>
      </div>

      {/* Path indicator */}
      <div className={styles.pathBar}>
        <span className={styles.pathLabel}>Path:</span>
        <span className={styles.path}>
          {activeTab === 'project'
            ? projectClaudePath || '.claude/CLAUDE.md'
            : userClaudePath || '~/.claude/CLAUDE.md'}
        </span>
      </div>

      {/* Sections */}
      <div className={styles.sections}>
        {sections.map((section) => (
          <div key={section.id} className={styles.section}>
            <div
              className={styles.sectionHeader}
              onClick={() => toggleSection(section.id)}
            >
              <span className={styles.sectionIcon}>{section.icon}</span>
              <span className={styles.sectionTitle}>{section.title}</span>
              <span className={styles.chevron}>
                {section.isExpanded ? '▼' : '▶'}
              </span>
              <button
                className={styles.editButton}
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(section);
                }}
                title="Edit"
              >
                ✏️
              </button>
              {section.id.startsWith('custom-') && (
                <button
                  className={styles.removeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSection(section.id);
                  }}
                  title="Remove"
                >
                  🗑️
                </button>
              )}
            </div>

            {section.isExpanded && (
              <div className={styles.sectionContent}>
                {editingSection === section.id ? (
                  <div className={styles.editMode}>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className={styles.editTextarea}
                      rows={15}
                    />
                    <div className={styles.editActions}>
                      <button onClick={cancelEdit} className={styles.cancelButton}>
                        Cancel
                      </button>
                      <button onClick={saveEdit} className={styles.confirmButton}>
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <pre className={styles.preview}>{section.content}</pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick tips */}
      <div className={styles.tips}>
        <h4>💡 Tips</h4>
        <ul>
          <li>Project CLAUDE.md applies to the current project only</li>
          <li>User CLAUDE.md applies to all your projects</li>
          <li>Use Markdown syntax for formatting</li>
          <li>Add custom sections for project-specific guidelines</li>
        </ul>
      </div>
    </div>
  );
}

export default ClaudeConfigEditor;
