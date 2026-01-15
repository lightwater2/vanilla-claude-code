# Vanilla Claude Code

> An intuitive IDE for Claude Code CLI, built on [Wave Terminal](https://github.com/wavetermdev/waveterm)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/lightwater2/vanilla-claude-code)](https://github.com/lightwater2/vanilla-claude-code/stargazers)

## Overview

Vanilla Claude Code is a modern, terminal-first IDE designed specifically for [Claude Code](https://claude.ai/claude-code) workflows. Inspired by [Warp](https://warp.dev), it combines the power of a full-featured code editor with seamless Claude Code CLI integration.

### Key Features

- **Claude Code Integration** - Dedicated tabs for Claude Code CLI with context awareness
- **GitHub Integration** - OAuth login, PR/Issue management, Git visualization
- **Modern Editor** - Monaco-based editor with full syntax highlighting
- **Tab Groups** - Organize your workflow with grouped tabs
- **CLAUDE.md Editor** - Visual editor for Claude configuration files
- **Skills & Agents** - Manage Claude skills and sub-agents visually

## Screenshots

> Coming soon

## Installation

### Download

| Platform | Download |
|----------|----------|
| macOS (Apple Silicon) | [Download](https://github.com/lightwater2/vanilla-claude-code/releases/latest) |
| macOS (Intel) | [Download](https://github.com/lightwater2/vanilla-claude-code/releases/latest) |
| Windows | [Download](https://github.com/lightwater2/vanilla-claude-code/releases/latest) |
| Linux | [Download](https://github.com/lightwater2/vanilla-claude-code/releases/latest) |

### Build from Source

```bash
# Prerequisites: Go 1.21+, Node.js 20+, pnpm 8+

# Clone
git clone https://github.com/lightwater2/vanilla-claude-code.git
cd vanilla-claude-code

# Install dependencies
pnpm install
go mod download

# Development
pnpm dev

# Build
pnpm package
```

## Quick Start

1. **Launch** Vanilla Claude Code
2. **Connect GitHub** - Click the user icon to authenticate
3. **Open Project** - Select your project folder
4. **Start Claude** - Press `Cmd+T` (or `Ctrl+T`) to open a Claude tab

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   Vanilla Claude Code                       │
├────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌─────────────────────────────────────────┐ │
│  │ Sidebar  │  │  [Claude] [Terminal] [Editor] [Git]     │ │
│  │          │  ├─────────────────────────────────────────┤ │
│  │ Files    │  │                                         │ │
│  │ Git      │  │  $ claude                               │ │
│  │ GitHub   │  │  > How can I help you today?            │ │
│  │ Claude   │  │  │                                      │ │
│  │          │  │                                         │ │
│  └──────────┘  └─────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Base | [Wave Terminal](https://github.com/wavetermdev/waveterm) |
| Backend | Go |
| Frontend | TypeScript, React |
| Desktop | Electron |
| Editor | Monaco Editor |
| Terminal | xterm.js |

## Roadmap

### Phase 1 - MVP
- [x] Project setup
- [ ] Wave Terminal fork & customization
- [ ] GitHub OAuth integration
- [ ] Claude Code terminal tab
- [ ] Basic Git integration

### Phase 2 - Core Features
- [ ] Tab groups
- [ ] CLAUDE.md editor
- [ ] Enhanced Git visualization
- [ ] PR/Issue panel

### Phase 3 - Advanced
- [ ] Skills browser
- [ ] Sub-agent management
- [ ] Theme customization
- [ ] Plugin system

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m '[YYMMDD-XXX-FEAT] Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

See [CLAUDE.md](CLAUDE.md) for detailed development guidelines.

```bash
# Quick commands
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm lint         # Lint code
```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Wave Terminal](https://github.com/wavetermdev/waveterm) - The amazing terminal that serves as our foundation
- [Claude Code](https://claude.ai/claude-code) - The AI coding assistant that inspired this project
- [Warp](https://warp.dev) - Design inspiration

## Links

- [Documentation](https://github.com/lightwater2/vanilla-claude-code/wiki)
- [Issues](https://github.com/lightwater2/vanilla-claude-code/issues)
- [Discussions](https://github.com/lightwater2/vanilla-claude-code/discussions)

---

Made with Claude Code
