# Vanilla Claude Code - Project Guidelines

## Project Overview

**Vanilla Claude Code**는 Claude Code CLI를 위한 직관적인 IDE입니다.
[Wave Terminal](https://github.com/wavetermdev/waveterm)을 베이스로 포크하여 개발합니다.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Base | Wave Terminal (Fork) |
| Backend | Go |
| Frontend | TypeScript + React |
| Desktop | Electron |
| Editor | Monaco Editor |
| Terminal | xterm.js |
| Auth | GitHub OAuth (Device Flow) |
| Git | isomorphic-git |

## Project Structure

```
vanilla-claude-code/
├── cmd/                    # Go entry points
├── pkg/                    # Go packages
│   ├── wavebase/          # Core utilities
│   ├── wconfig/           # Configuration
│   ├── wshrpc/            # RPC system
│   └── service/           # Backend services
│       ├── github/        # GitHub OAuth & API
│       └── claude/        # Claude Code integration
├── frontend/              # React frontend
│   ├── app/               # Main app
│   ├── components/        # UI components
│   │   ├── tabs/          # Tab system
│   │   ├── editor/        # Monaco editor wrapper
│   │   ├── terminal/      # Terminal components
│   │   ├── git/           # Git UI components
│   │   ├── github/        # GitHub integration UI
│   │   └── claude/        # Claude-specific UI
│   ├── hooks/             # React hooks
│   ├── stores/            # State management
│   └── types/             # TypeScript types
├── assets/                # Static assets
├── docs/                  # Documentation
├── scripts/               # Build scripts
└── .claude/               # Claude Code config
    └── skills/            # Custom skills
```

## Core Features

### P0 (MVP)
- [ ] GitHub OAuth 연동 (Device Flow)
- [ ] Git 변경점 추적/시각화
- [ ] 코드 에디터 (Monaco)
- [ ] Claude Code CLI 탭
- [ ] 일반 터미널 탭

### P1
- [ ] 탭 그룹 시스템
- [ ] CLAUDE.md 편집기
- [ ] 프로젝트 설정 패널

### P2
- [ ] 스킬/서브에이전트 관리 UI
- [ ] 테마 커스터마이징
- [ ] 키보드 단축키 설정

## Coding Conventions

### Go (Backend)

```go
// Package naming: lowercase, single word
package github

// Interface naming: -er suffix or descriptive
type Authenticator interface {
    Authenticate(ctx context.Context) (*Token, error)
}

// Error handling: wrap with context
if err != nil {
    return fmt.Errorf("failed to authenticate: %w", err)
}

// Constants: PascalCase for exported
const (
    DefaultTimeout = 30 * time.Second
    maxRetries     = 3
)
```

### TypeScript (Frontend)

```typescript
// Component files: PascalCase
// ClaudeTerminal.tsx

// Hooks: camelCase with 'use' prefix
// useGitHubAuth.ts

// Types: PascalCase with optional prefix
interface GitHubUser {
  id: number;
  login: string;
  avatarUrl: string;
}

// Constants: UPPER_SNAKE_CASE
const MAX_TABS = 10;
const DEFAULT_THEME = 'dark';

// Boolean variables: is/has/can prefix
const isAuthenticated = true;
const hasChanges = false;
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TabGroup.tsx` |
| Hooks | camelCase | `useTerminal.ts` |
| Utils | camelCase | `gitUtils.ts` |
| Types | camelCase | `types.ts` |
| Tests | *.test.ts | `TabGroup.test.tsx` |
| Styles | *.module.css | `TabGroup.module.css` |

## Git Workflow

### Branch Strategy

```
main              - 안정 릴리스
├── develop       - 개발 통합
│   ├── feature/* - 새 기능
│   ├── bugfix/*  - 버그 수정
│   └── refactor/*- 리팩토링
└── hotfix/*      - 긴급 수정
```

### Commit Message Format (Korean)

```
[YYMMDD-XXX-TYPE] 커밋 메시지

상세 설명 (선택)
- 변경사항 1
- 변경사항 2
```

**Types:**
- `FEAT`: 새 기능
- `FIX`: 버그 수정
- `DOCS`: 문서
- `STYLE`: 포맷팅
- `REFACTOR`: 리팩토링
- `TEST`: 테스트
- `CHORE`: 빌드/설정

### PR Template

```markdown
## Summary
- 변경사항 요약

## Changes
- [ ] 체크리스트

## Test Plan
- 테스트 방법

## Screenshots (optional)
```

## Development Setup

### Prerequisites

```bash
# Required
- Go 1.21+
- Node.js 20+
- pnpm 8+

# Optional
- Docker (for testing)
```

### Initial Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/vanilla-claude-code.git
cd vanilla-claude-code

# Install dependencies
pnpm install

# Setup Go modules
go mod download

# Start development
pnpm dev
```

### Build Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm dev:electron # Start Electron dev

# Build
pnpm build        # Build frontend
pnpm build:go     # Build Go backend
pnpm package      # Package for distribution

# Test
pnpm test         # Run tests
pnpm lint         # Lint code
pnpm typecheck    # TypeScript check
```

## GitHub OAuth Setup

### 1. Create OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App:
   - **Application name:** Vanilla Claude Code
   - **Homepage URL:** https://github.com/YOUR_USERNAME/vanilla-claude-code
   - **Callback URL:** http://127.0.0.1:8888/callback
   - **Enable Device Flow:** ✅

### 2. Environment Variables

```bash
# .env.local (do not commit!)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### 3. Required Scopes

```
repo        - Full repository access
read:user   - Read user profile
workflow    - GitHub Actions (optional)
```

## Architecture Decisions

### Why Wave Terminal as Base?

1. **Terminal-First**: 이미 터미널 + IDE 하이브리드 구조
2. **AI Ready**: AI 통합 인프라 존재
3. **Tab System**: 탭/패널 시스템 구현됨
4. **Monaco Editor**: VSCode 스타일 에디터 내장
5. **Apache 2.0**: 상업적 사용 가능
6. **Active Development**: 활발한 개발 진행 중

### Key Customizations

1. **Claude Code Integration**
   - 전용 터미널 타입 추가
   - Claude-specific 명령어 지원
   - 컨텍스트 공유 기능

2. **GitHub Integration**
   - Device Flow 인증
   - PR/Issue 관리 패널
   - Git diff 시각화

3. **CLAUDE.md Management**
   - 전용 에디터 위젯
   - 스킬 브라우저
   - 서브에이전트 관리

## Error Handling

### Backend (Go)

```go
// Custom error types
type AuthError struct {
    Code    string
    Message string
    Cause   error
}

func (e *AuthError) Error() string {
    return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

// Always wrap errors with context
func authenticate() error {
    token, err := fetchToken()
    if err != nil {
        return &AuthError{
            Code:    "AUTH_FAILED",
            Message: "Failed to fetch token",
            Cause:   err,
        }
    }
    return nil
}
```

### Frontend (TypeScript)

```typescript
// Use Result pattern for error handling
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function authenticate(): Promise<Result<GitHubUser>> {
  try {
    const user = await github.getUser();
    return { ok: true, value: user };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// Component test example
describe('ClaudeTerminal', () => {
  it('should render terminal with Claude CLI', () => {
    render(<ClaudeTerminal />);
    expect(screen.getByRole('terminal')).toBeInTheDocument();
  });

  it('should execute claude command on init', async () => {
    render(<ClaudeTerminal />);
    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith('claude');
    });
  });
});
```

### Integration Tests

```go
// Go integration test example
func TestGitHubAuth(t *testing.T) {
    ctx := context.Background()
    client := NewGitHubClient(testClientID)

    token, err := client.DeviceAuth(ctx)
    require.NoError(t, err)
    require.NotEmpty(t, token.AccessToken)
}
```

## Security Guidelines

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Both frontend and backend
3. **Use secure storage** - OS keychain for tokens
4. **HTTPS only** - For all external API calls
5. **Rate limiting** - Implement for GitHub API calls

## Performance Guidelines

1. **Lazy load components** - Split code by route
2. **Virtualize long lists** - For file trees, logs
3. **Debounce inputs** - Search, resize events
4. **Cache API responses** - With TTL
5. **Use Web Workers** - For heavy computations

## Contributing

1. Fork the repository
2. Create feature branch (`feature/amazing-feature`)
3. Commit changes (follow commit message format)
4. Push to branch
5. Open Pull Request

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.
