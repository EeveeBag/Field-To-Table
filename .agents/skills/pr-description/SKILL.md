---
name: pr-description
description: Generate a GitHub pull request description from the project's current branch changes and PR template. Use when the user asks for a PR description, PR summary, merge description, or wants copy-ready Markdown for a GitHub PR body.
---

# Pull Request Description

Generate a copy-ready pull request description based on the current branch changes and the repository's PR template.

## Trigger

Use this skill when the user asks for a PR description, PR summary, merge description, or a copy-ready PR body.

## Workflow

### 1. Collect change context

Inspect the current branch and include:

- committed changes relative to `main`
- staged changes
- unstaged changes
- untracked files

Useful commands:

```bash
git branch --show-current
git log main..HEAD --oneline
git diff main --name-status
git diff main --stat
git ls-files --others --exclude-standard
```

### 2. Classify the change

Map the diff into one or more buckets:

- Code added or removed
- Business logic updated
- Refactor or optimization
- UI changes
- Config changes

### 3. Write the description

The description should explain:

- what changed
- why it changed
- which modules or files were affected

Use numbered points for the main description section.

### 4. Choose testing checkboxes

Infer the most likely testing method from the change:

- UI change -> usually hand testing
- API or logic change -> hand testing and/or automated testing
- config-only change -> build or startup verification

## Output Format

Always:

1. add a short instruction line before the block
2. wrap the PR body in a fenced `markdown` code block
3. preserve checkbox syntax exactly as raw Markdown

Use this shape:

````markdown
Below is your PR description. Copy the complete contents of the code block and paste it into the GitHub PR description field:

```markdown
### PR Details

<!-- Describe what this PR changes, what problem it solves, or which files/modules it updates -->

1. ...
2. ...

### PR Type

<!-- Check all categories that apply to this PR -->

- [x] Code added or removed
- [ ] Business logic updated
- [ ] Refactor or optimization
- [ ] UI changes
- [ ] Config changes

### Testing

<!-- Check the testing methods used for this PR -->

- [x] Manual testing
```
````

## Rules

- Do not invent changes not supported by git state
- If the diff is ambiguous, ask a focused follow-up question
- Keep all checkbox markers exact: `- [x]` or `- [ ]`
- Keep HTML comments when the template expects them
