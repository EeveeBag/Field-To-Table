---
name: git-commit
description: Analyze staged and unstaged git changes, group related files, and suggest Traditional Chinese commit messages. Use when the user says "commit", "prepare commit", "group my changes", "suggest commit message", or wants to organize uncommitted work into logical commits.
---

# Git Commit

Analyze current git changes, group related files into logical commits, and provide commit messages primarily in Traditional Chinese (繁體中文). Keep Conventional Commits prefixes and scopes in English, but write the descriptive part of the message and the summaries in Traditional Chinese. Do not execute any `git commit` commands.

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

Review all changed files, including staged, unstaged, and untracked changes, and group them by logical unit of work:

- files that serve the same purpose belong in one group
- config changes related to a feature go with that feature
- unrelated fixes should be split into separate groups
- lock files should stay with the dependency change that caused them

### 3. Output format

Present results as a numbered list. Each group should include:

1. **Commit message**: one line using Conventional Commits with an optional scope such as `feat(backend):`, `fix(frontend):`, or `chore(shared):`. Keep the prefix and scope in English, but write the message body in Traditional Chinese.
2. **Files**: the files included in the group
3. **Summary**: a short explanation of what that group of changes does, written in Traditional Chinese

Example output:

```text
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
Summary: 啟用 lint 規則以維持整個 repo 的程式碼風格一致。
```

## Rules

- Keep Conventional Commits prefixes and scopes in English
- Write the commit message body in Traditional Chinese
- Use scopes based on file location when appropriate: `apps/frontend/` -> `frontend`, `apps/backend/` -> `backend`, `packages/shared/` -> `shared`
- Omit the scope when changes span multiple areas or only touch repo-level files
- Write summaries in Traditional Chinese
- Keep messages under 72 characters when practical
- Do not run `git add` or `git commit`
- If there are no changes, report that the working tree is clean
- Do not include files likely containing secrets in suggested commit groups; warn the user if detected
