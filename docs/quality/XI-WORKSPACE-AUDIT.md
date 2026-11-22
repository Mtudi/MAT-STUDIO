# Xi Workspace — Design, Security and UX Audit

Updated: 2026-11-22
Source: `projects/ai-workspace/index.html`, `api/chat.js`, `api/supabase-config.js`, and Supabase project metadata.

## Preserved behavior

- Conversation history and local persistence.
- Search, new chat, rename, delete, export and clear actions.
- Supabase guest authentication and optional email sign-in/cloud sync.
- Server-side OpenRouter streaming through `/api/chat`.
- Owner access-code authentication.
- Markdown/code rendering via safe DOM construction.
- Existing Modo digital character and animation states.
- Existing light/dark theme, accent options, RTL/Arabic mode and mobile drawer.

## Design pass

- Refined the neutral dark surfaces and softened the existing Xi green accent without changing the app identity.
- Tightened the desktop sidebar and expanded the readable message/composer column.
- Improved message spacing, user bubble width, composer shape, settings modal spacing and mobile sizing.
- Replaced stale provider cards with accurate server/guest onboarding actions.
- Kept Modo and all existing app/backend behavior intact.

## Security improvements in this release candidate

- Require a same-origin `Origin` on POST requests; compare it with the actual request host so Vercel preview deployments can use their own host without adding wildcard CORS.
- Compare owner access codes using `crypto.timingSafeEqual` after equal-length validation.
- Limit repeated incorrect owner-code attempts to six before a 15-minute per-process lockout.
- Keep the OpenRouter provider key and Supabase publishable key in server environment variables; only the publishable key is returned by `/api/supabase-config`.
- Continue verifying guest access tokens against Supabase Auth and require `is_anonymous === true` before allowing guest chat.
- Keep conversation and message RLS ownership policies tied to `auth.uid()`; messages are accessible only through a conversation owned by the same user.

The owner-code attempt counter is in-memory and may reset between serverless instances. It is a useful abuse barrier, not a durable distributed rate limiter. A future public launch with broader traffic should use a shared rate-limit service or edge/WAF rule.

## Supabase findings

- `ai_conversations` and `ai_messages` both have RLS enabled.
- The conversation policy checks `auth.uid() = user_id`.
- The message policy checks that the parent conversation belongs to `auth.uid()`.
- Supabase warns about anonymous-access policies because anonymous sign-ins are enabled. This is intentional for guest chat; it does not mean guests can read one another's rows under the current ownership predicates.
- Leaked-password protection is currently disabled in the connected Supabase project. Review and enable it in Auth settings before relying on email/password accounts. It does not block the guest-only flow.

## Automated verification

- Static HTML/inline JavaScript validation and duplicate-ID checks.
- API tests for same-origin preview access, missing/foreign Origin rejection, owner code verification, lockout, anonymous-token validation, malformed requests, server-side provider errors and SSE streaming.
- Playwright Chromium checks for welcome UI, guest sign-in mock, streamed chat mock, local persistence, search, Arabic RTL, theme switching, mobile navigation and horizontal overflow.

The browser suite uses mocked Supabase and OpenRouter responses. It validates the client flow and request shape, not live provider billing, production secrets, email delivery or actual cloud-sync persistence.

## Remaining production release checks

- Verify the protected Vercel preview through an authenticated browser or Vercel CLI.
- Run one real guest session and one real streamed response against the configured server-side OpenRouter key.
- Test owner login with the configured workspace access code.
- Verify email magic-link delivery and cloud history sync with a real email account.
- Review leaked-password protection in Supabase Auth settings.
- Test long response, cancellation, network interruption and provider-rate-limit states.
