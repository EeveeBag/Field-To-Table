---
name: package-issue-sop
description: Troubleshoot third-party package, library, framework, and tool issues with a docs-first workflow. Use when the user hits install failures, dependency conflicts, third-party TypeScript errors, runtime issues, UI library problems, build or SSR issues, or asks how to use an external package. Prioritize official documentation via Context7 before proposing fixes.
---

# Package Issue SOP

Handle third-party package problems with a docs-first workflow. Unless the user explicitly says not to use this SOP, treat package-related questions as a match for this skill.

## Trigger

Use this skill for issues involving external packages, libraries, frameworks, UI kits, build tools, lint tools, or their APIs, including:

- install failures or dependency conflicts
- TypeScript errors related to third-party packages
- runtime errors from external packages
- UI component behavior issues
- build, bundling, or SSR problems
- questions about package usage

## Workflow

### 1. Gather missing context

If the user did not provide enough detail, ask only for the essentials:

- package name and version
- framework and runtime version
- exact error message
- minimal reproduction snippet
- expected behavior vs actual behavior

### 2. Use official docs first

This skill should try Context7 before relying on memory:

1. Resolve the package with `mcp__context7__resolve-library-id`
2. Query docs with `mcp__context7__query-docs`
3. Prioritize API docs, troubleshooting, migration notes, and breaking changes

If Context7 cannot verify the answer, clearly label the conclusion as inference rather than documentation-backed fact.

### 3. Diagnose by category

Check the category that best matches the issue:

- install and dependency issues
- TypeScript or typing issues
- runtime issues
- UI component issues
- performance issues
- build or SSR issues

Within the chosen category, look for version compatibility, import style, config mismatches, peer dependencies, environment assumptions, and package-specific constraints from the docs.

### 4. Propose fixes

Provide:

1. a primary fix with the smallest practical change
2. alternative A with tradeoffs
3. alternative B with tradeoffs, if useful

Prefer concrete code or config changes over abstract advice.

## Response Format

Use this structure:

```markdown
## Summary

[One sentence describing the issue and the proposed fix]

## Suspected Root Cause

**Cause:** [Specific explanation]

**Evidence:**

- [Documentation-backed evidence]
- [If not verifiable, clearly mark it as an inference]

## Fix

### Concrete Change

[Smallest practical fix with relevant example]

### Alternative A

**When to use:** [...]
**Tradeoff:** [...]

### Alternative B

**When to use:** [...]
**Tradeoff:** [...]

## Checklist

- [ ] [Verification item 1]
- [ ] [Verification item 2]

## Supporting Docs

- [Context7 summary and links]
```

## Rules

- Do not post PR comments or external messages
- Label each recommendation as docs-backed or inferred
- Ask for clarification instead of guessing when critical context is missing
- Keep the answer practical and specific
