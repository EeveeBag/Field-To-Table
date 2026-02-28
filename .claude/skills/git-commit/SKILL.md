---
name: git-commit
description: Analyze staged and unstaged git changes, group related files, and suggest Traditional Chinese commit messages. Use when the user says "commit", "prepare commit", "group my changes", "suggest commit message", or wants to organize uncommitted work into logical commits.
---

# Git Commit

Analyze current git changes, group related files into logical commits, and provide Traditional Chinese (繁體中文) commit messages. Do NOT execute any git commit commands.

## Workflow

### 1. Collect change information

Run these commands in parallel:

```bash
git status
git diff
git diff --cached
git log --oneline -5
```

### 2. Analyze and group changes

Review all changed files (staged + unstaged + untracked) and group them by logical unit of work:

- Files that serve the same purpose belong in one group (e.g. a new feature + its test)
- Config changes related to a feature go with that feature
- Independent changes (e.g. a typo fix unrelated to a feature) get their own group
- Lock files (pnpm-lock.yaml, package-lock.json) go with the package.json change that caused them

### 3. Output format

Present results as a numbered list. Each group contains:

1. **Commit message** — one-line, following Conventional Commits with **scope**：`feat(backend):`, `fix(frontend):`, `chore(shared):` 等。Scope 根據變更檔案所在的 app/package 決定：`frontend`, `backend`, `shared`。若變更跨多個 scope 或屬於根目錄設定，可省略 scope。
2. **Files** — list of files in the group
3. **Summary** — 1-2 sentence explanation of what this group of changes does

Example output:

```
### Group 1
Message: feat(backend): 新增議題搜尋 API
Files:
  - apps/backend/src/routes/issues.openapi.ts
  - apps/backend/src/routes/issues.handler.ts
Summary: 在議題列表 API 端點加入關鍵字搜尋功能。

### Group 2
Message: feat(frontend): 新增議題搜尋元件
Files:
  - apps/frontend/src/components/IssueSearchBar.tsx
  - apps/frontend/src/hooks/useIssueSearch.ts
Summary: 新增前端搜尋元件與對應的 hook。

### Group 3
Message: chore: 更新 ESLint 設定
Files:
  - eslint.config.js
Summary: 啟用程式碼風格規則以統一格式（根目錄設定，省略 scope）。
```

## Rules

- Conventional Commits prefix 與 scope 保持英文（如 `feat(backend):`），冒號後面的描述使用繁體中文
- Scope 依據變更檔案位置決定：`apps/frontend/` → `frontend`、`apps/backend/` → `backend`、`packages/shared/` → `shared`
- 若變更橫跨多個 scope 或僅涉及根目錄檔案（如 `eslint.config.js`、`turbo.json`），可省略 scope
- Keep messages under 72 characters
- Summary 也使用繁體中文
- Do NOT run `git add` or `git commit`
- If there are no changes, report that the working tree is clean
- Do not include files that likely contain secrets (.env, credentials, etc.) — warn the user if detected
