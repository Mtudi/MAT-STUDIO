# MATUDI PES — Quality Gates

Operational checklist for applying the MATUDI Five-Layer Review to a project release.

## 1. Systematic debugging
- Reproduce the bug and record exact steps, expected result, and actual result.
- Collect evidence: console output, network response, stack trace, logs, or a failing test.
- Trace the cause before editing; distinguish root cause from symptoms.
- Make the smallest safe correction.
- Rerun the failing case and regression tests for nearby functionality.

## 2. Independent code review
- Review the full diff, not only the final rendered page.
- Check correctness, state handling, async behavior, validation, error paths, maintainability, and regressions.
- Inspect dependency changes and remove unnecessary packages.
- Check for secrets, unsafe HTML injection, exposed debug endpoints, and inappropriate logging.
- If CodeRabbit is configured, use it as a second opinion; independently validate findings.

## 3. Risk-based security review
- Identify trust boundaries, sensitive data, authentication, authorization, and public endpoints.
- Verify server-side authorization; never rely only on hidden UI controls.
- Validate and constrain untrusted input; encode output appropriately.
- Check secret storage, environment variables, dependency risk, CORS, and error disclosure where relevant.
- For GitHub Actions, inspect workflow permissions, untrusted event data, third-party action pinning, token scope, and agent/sandbox boundaries.
- Run the Trail of Bits Actions auditor only when the workflow is in scope and the actual compatible tool is available.
- Record findings and severity; do not label a checklist pass as a formal penetration test or certification.

## 4. Accessibility review
- Use semantic landmarks, headings, buttons, links, and form controls.
- Ensure controls have meaningful accessible names and form fields have labels.
- Verify full keyboard operation, logical focus order, visible focus, and no keyboard traps.
- Check text and UI contrast, zoom/reflow, touch target usability, and error announcements.
- Respect reduced-motion preferences.
- Use automated scans as assistance, then manually inspect keyboard and relevant assistive-technology behavior.
- Do not claim WCAG conformance from an automated score alone.

## 5. Real-browser / E2E review
- Confirm the app starts in the intended environment and dependencies are available.
- Use Playwright when supported to test the main journeys from a real browser.
- Cover navigation, core interactions, forms, persistence, responsive layouts, and important failure states.
- Check browser console and failed network requests.
- Capture screenshots or traces when they provide useful evidence; avoid storing private user data.
- If no browser/runtime is available, mark E2E as NOT VERIFIED and state the fallback method used.

## Minimum release report

| Gate | Status | Evidence / reason |
|---|---|---|
| Root-cause debugging | Passed / Failed / Skipped / N/A | Reproduction and retest |
| Code review | Passed / Failed / Skipped / N/A | Diff reviewed; tool if used |
| Security review | Passed / Failed / Skipped / N/A | Scope and findings |
| Accessibility | Passed / Failed / Skipped / N/A | Automated + manual coverage |
| Browser / E2E | Passed / Failed / Skipped / N/A | Browser, flows, and result |

Also report:
- **Verified:** checks directly executed and passed.
- **Not verified:** checks unavailable or not run.
- **Known limitations:** remaining defects, prototype behavior, external dependencies, and untested devices.

A release must not be called fully QA-verified when a critical applicable gate failed or was skipped. Explain the gap and the next practical verification step.
