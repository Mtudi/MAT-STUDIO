# Vercel Deployment Audit — 2026-11-26

## Scope and method

Read-only inspection of the linked Vercel team and the public production URLs. No project settings, domains, environment variables, GitHub branches, deployments, or protections were changed.

A Vercel `READY` state is treated only as deployment completion. Public URL checks below confirm HTTP response and document identity, not full interactive/browser acceptance.

## Confirmed production URL checks

| URL | HTTP | Document identity |
|---|---:|---|
| `https://matudi-projects-hub.vercel.app` | 200 | `MATUDI — Projects` |
| `https://mat-studio.vercel.app` | 200 | `Xi — Personal AI` |
| `https://matudi-deutsch.vercel.app` | 200 | `MATUDI DEUTSCH — MAT-STUDIO` |
| `https://matsong-player.vercel.app` | 200 | `MATSONG — Crimson Edition` |
| `https://matudi-chess-lab.vercel.app` | 200 | `Chess Lab — MAT-STUDIO` |
| `https://matudi-portfolio.vercel.app` | 200 | `MATUDI Portfolio — MAT-STUDIO` |

The production root `mat-studio.vercel.app` is the Xi Personal AI app. This matches the current MAT-STUDIO source root `index.html`.

## Confirmed routing / source mismatches

1. The public Hub at `matudi-projects-hub.vercel.app` is deployed as a separate Vercel project. Its latest deployment metadata contains no Git repository metadata. A matching Hub source file was not found in the inspected MAT-STUDIO repository paths or code search. Its deployed HTML contains hard-coded preview deployment URLs rather than stable canonical project URLs.
2. The Hub's “MATUDI AI Workspace” card points to a URL whose HTML title is `Xi — Personal AI`. This is a confirmed wrong-app link.
3. The Hub's other project cards also use deployment-specific preview URLs, which are less stable than canonical project domains.
4. In the MAT-STUDIO `main` branch, `projects/ai-workspace/index.html` has the same document title and byte size as the root Xi app, and the fetched source content is the Xi interface. It is not currently a distinct Workspace UI.
5. The deployed `matudi-ai-engine.vercel.app` root responds with HTTP 404. This alone does not prove the API is broken: an API-only service may not serve a root page. Verify a documented health/API route before changing it.
6. Several earlier deployment records were created from branches associated with other projects. Their deployment state being READY does not validate that the project-specific source was deployed.

## Canonical source routes in MAT-STUDIO main

- Xi Personal AI: `/` → `index.html`
- MATUDI AI Workspace: `/projects/ai-workspace/index.html` (currently source identity overlaps Xi; must be separated before public promotion)
- MATSONG: `/projects/matsong/index.html`
- MATUDI DEUTSCH: `/projects/deutsch/index.html`
- Chess Lab: `/projects/chess-lab/index.html`
- MATUDI Christmas: `/projects/christmas/index.html`
- MATUDI Portfolio: `/projects/portfolio/index.html`
- Motion Atelier: `/Motion%20Atelier%203D%20Studio.html`

## Safe remediation sequence

1. Recover or recreate the Hub source in a tracked MAT-STUDIO directory; do not overwrite the Xi root `index.html`.
2. Replace hard-coded deployment preview URLs with stable canonical production URLs and correct the Workspace card only after the Workspace UI has its own verified source.
3. Separate the Xi and Workspace source identities, then add automated checks that prevent the two routes from sharing the same document title/content.
4. Map each Vercel project's Root Directory and Production Branch to its intended source path/branch. Do not guess these settings from deployment names.
5. Keep MAT-CORE private. Do not expose its source, AI Engine secrets, owner tokens, or environment variable values.
6. After mapping is verified, deploy one project at a time and test desktop/mobile, core interactions, auth/error states, and runtime logs before promoting.

## Explicitly not done

- No Vercel project setting or protection changed.
- No domain changed.
- No deployment triggered.
- No PR merged.
- No repository content or production app changed.
