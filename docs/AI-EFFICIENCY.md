# MAT-STUDIO — AI Efficiency & Token Policy

**Status:** Active working standard  
**Scope:** Every AI assistant, agent, skill, script, and automation used across MAT-STUDIO projects.

## 1. Core objective

Deliver reliable work with the smallest necessary context, fewest redundant model calls, and least avoidable cost. Efficiency must never come at the expense of correctness, security, or the user's approval.

## 2. Token and cost discipline

- Start with a short task plan before substantial work.
- Read only the files and sections relevant to the task; do not load the entire repository by default.
- Prefer focused diffs, summaries, and targeted excerpts over repeatedly pasting full files.
- Reuse verified project notes and handoff summaries instead of repeating long conversation history.
- Batch independent, low-risk lookups when doing so reduces overhead; keep dependent operations sequential.
- Avoid asking the model to regenerate content that already exists and can be reused.
- Do not claim an exact token count, remaining quota, or price unless the platform exposes a reliable measurement.
- When model choice is available, use the least expensive capable model for routine work; reserve stronger models for complex architecture, difficult debugging, security-sensitive review, or high-impact decisions.
- If the expected work is unusually large or likely to incur meaningful cost, explain the scope and ask the user before proceeding.

## 3. Context management

For each project, maintain concise project notes containing:
- Purpose and current status
- Tech stack and important constraints
- Key file paths and architecture
- Decisions already made
- Known issues and next actions

Before a new task:
1. Read the relevant project notes.
2. Identify the smallest set of files needed.
3. State assumptions only when they materially affect the result.
4. Ask one focused question if a critical detail is missing.

After substantial work, update the handoff summary with decisions, changed files, tests, and remaining work. Do not store secrets or sensitive personal data in project notes.

## 4. Model routing

Choose a model based on task difficulty, not habit:

| Task | Preferred approach |
|---|---|
| Simple edits, formatting, documentation | Fast / lower-cost capable model |
| Routine code implementation | Standard coding-capable model |
| Multi-file architecture or complex debugging | Strong reasoning / coding model |
| Security review or risky migrations | Strong model plus independent checks |
| Repetitive deterministic work | Script or automation where practical |

If the platform does not expose model selection or cost controls, do not imply that routing is happening automatically.

## 5. Tool and repository discipline

- Use GitHub search and file reads narrowly; avoid repeated full-repository scans.
- Inspect the current state before editing.
- Prefer small, reviewable commits and descriptive commit messages.
- Run relevant tests or checks after changes when available.
- Do not perform destructive actions, broad rewrites, merges, deployments, or permission changes without explicit user approval.
- Never assume a tool call succeeded; verify its result.

## 6. Caching and reuse

- Reuse stable outputs such as project architecture summaries, setup instructions, and verified conventions.
- Re-check information that changes frequently, including dependencies, API behavior, pricing, and deployment status.
- Do not cache credentials, access tokens, private keys, or other secrets.
- Keep cached notes short and attach a date or version when freshness matters.

## 7. Security rules

- Never commit API keys, GitHub personal access tokens, OAuth secrets, passwords, or environment files.
- Store secrets only in the platform's approved secret manager or environment-variable settings.
- Grant the minimum required permissions and scope credentials to the intended repository.
- Treat third-party skills, MCP servers, scripts, and copied prompts as untrusted until reviewed.
- Do not paste private tokens into chat, issues, pull requests, logs, or source files.
- If a token may have been exposed, revoke it and create a replacement.

## 8. Approval gates

Ask the user before:
- A task expected to require extensive model usage or paid API calls
- Installing a third-party skill, MCP server, or dependency with meaningful access
- Changing authentication, permissions, secrets, or billing settings
- Deleting data, rewriting major project areas, merging, or deploying

Routine read-only inspection and small, reversible work may proceed within the user's existing instructions.

## 9. Task report

For substantial tasks, finish with a compact report:

- **Changed:** files or resources modified
- **Checked:** tests, validations, or inspections performed
- **Efficiency:** what was kept narrow or reused
- **Risks:** anything not verified
- **Next:** one recommended next action

## 10. Important distinction: GitHub access vs AI tokens

A GitHub Personal Access Token grants access to GitHub resources according to its permissions. It does **not** provide Claude, ChatGPT, or any other model with free AI tokens, credits, or extra usage quota. AI usage limits and billing are controlled separately by each AI provider and plan.
