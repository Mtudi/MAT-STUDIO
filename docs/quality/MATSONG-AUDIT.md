# MATSONG — Release Audit

Updated: 2026-11-22

## Product decision

Promote the better Crimson Edition player architecture from the experimental Next branch to the canonical `projects/matsong/index.html` path, while preserving the previous production HTML in `archive/crimson-edition-v1.html`.

## Improvements

- Reuse `matsong-crimson-db` so existing local audio blobs survive; upgrade database version 1 to version 2 and add a playlists object store.
- Remove the arbitrary two-minute duration restriction for both local files and Spotify catalog results.
- Fix active-row highlighting and separate the imported-local-files view from Spotify metadata.
- Preserve favorites on Spotify catalog refresh and allow Spotify tracks to be saved in MATSONG Favorites.
- Add PKCE refresh-token handling, retry a Spotify API 401 once after refreshing, profile status and a Disconnect action.
- Set the Spotify SDK callback before injecting its script, handle account/auth/initialization/autoplay errors and expose a clear Premium requirement.
- Retain an official Spotify embed fallback for users without Premium or where Web Playback SDK is unavailable.
- Add keyboard-accessible seeking, Media Session/lock-screen actions, reduced-motion handling and more accessible labels.
- Keep the existing crimson/charcoal design and one-file architecture.

## Safety and product boundaries

- The Spotify client ID is public; no Spotify client secret is included.
- Spotify redirect URI is the existing stable production URL and must remain registered in the Spotify Developer Dashboard.
- The Sharable Link preview disables Spotify OAuth because its host is not the registered redirect URI; local files and official embeds remain available there.
- Local audio is stored in the browser only. It is not uploaded to the server or synchronized across devices.
- Full-track Spotify Web Playback SDK playback requires Spotify Premium. A free account can still use catalog search and the official embed where Spotify allows it.
- This is a personal/non-commercial player, not a Spotify-branded product.

## CI verification

- Static HTML and inline JavaScript validation.
- Playwright tests for v1 IndexedDB migration, short-file import/playback, favorites, playlists, reload persistence, Spotify embed URL validation, mobile overflow, PKCE state validation, token refresh, catalog search, player request and disconnect.
- External Spotify OAuth/API/SDK responses are mocked in CI. No real Spotify account or live playback is claimed.

## Release gate

Vercel's daily API deployment quota is exhausted and requires a 24-hour wait. Do not attempt to bypass it. After quota reset, deploy the tested branch, verify the registered Spotify redirect URI, connect a real eligible Premium account, test one full-track play and test the official embed on Android/mobile before merging.
