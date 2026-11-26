# MATUDI PES — Project Starter

Use this checklist at the start of every new project or major project phase.

## Before implementation
- Read the latest STANDARD.md, CHANGELOG.md, and QUALITY-GATES.md.
- Inspect the current repository/files and preserve existing work.
- Write or update the project brief using PROJECT-BRIEF-TEMPLATE.md.
- Identify user journeys, required interactions, target devices, and acceptance criteria.
- Research relevant competitors, references, and technical documentation when useful.
- Choose the simplest suitable architecture and implementation plan.

## During implementation
- Follow the approved project identity and design direction.
- Keep code maintainable and dependencies justified.
- Make controls functional and states understandable.
- Optimize mobile responsiveness, motion, accessibility, and resource use.
- Keep a short list of decisions, risks, and discovered issues.
- When a defect appears, reproduce and trace root cause before changing code.

## Before delivery — required quality gates
- Run syntax, lint, type, and build checks that fit the stack.
- Review the complete change set for correctness, security, maintainability, and regressions.
- Run security checks appropriate to the app, auth model, dependencies, and CI workflows.
- Test accessibility: semantic structure, keyboard, focus, labels, contrast, zoom/reflow, reduced motion.
- Run Playwright browser/E2E checks for primary flows when the runtime is available.
- Check responsive layouts and touch behavior at realistic viewport sizes.
- Test key error, empty, loading, and edge states.
- Review performance and resource cleanup.
- Fix issues and rerun failed and impacted checks.
- Record passed, failed, skipped gates and reasons in the delivery report.
- Report verified, not verified, and known limitations honestly.
- Provide the live preview/source link when available.

## Continuous updates
When the user explicitly asks to add a rule to MATUDI PES:
1. Update STANDARD.md.
2. Add a dated entry to CHANGELOG.md.
3. Update the version when the change is meaningful.
4. Update related checklists or guidance documents.
5. Verify the committed files.
6. Apply the new rule to future work.
