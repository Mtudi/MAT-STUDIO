# MATSONG — Crimson Edition

A single-file, local-first music player with an optional Spotify connection.

## Features

- Import local audio files: MP3, M4A, WAV, OGG, FLAC, AAC and OPUS.
- IndexedDB library, favorites and playlists.
- Search Spotify tracks after connecting a Spotify account.
- Full-track in-app Spotify playback through the official Web Playback SDK (Spotify Premium required).
- Official Spotify track, album, playlist, artist, show and episode embeds as a fallback.
- Automatic Spotify access-token refresh using the PKCE refresh token.
- Shuffle, repeat, volume, seek controls and Media Session/lock-screen actions where supported.
- Dark/crimson and light themes, keyboard seek, reduced-motion support and mobile layout.

## Data and migration

- The app remains a single standalone HTML file; no React, npm build or server is required for local playback.
- Local audio blobs, Spotify metadata, favorites and playlists are stored in the browser's IndexedDB.
- The release reuses the existing `matsong-crimson-db` database and upgrades it from version 1 to version 2 by adding the playlists store. Existing local tracks are preserved.
- Audio files are not uploaded to MATSONG or its server. Clearing browser site data can remove the local library.
- The previous production HTML is preserved at `archive/crimson-edition-v1.html` for rollback.

## Spotify connection

- Uses Spotify Authorization Code with PKCE; no client secret is embedded in the page.
- Redirect URI: `https://mat-studio.vercel.app/projects/matsong/index.html`. This exact URI must be registered in the Spotify Developer Dashboard for the app's client ID.
- Catalog search works with a connected Spotify account. Full-track playback inside MATSONG requires an eligible Spotify Premium account and a supported browser/device.
- The official Spotify embed is available as a fallback and may require the listener to sign in to Spotify.
- OAuth refresh tokens are kept in session storage and cleared by Disconnect. Access tokens are refreshed automatically after expiry or a 401 response.
- Spotify's Web Playback SDK is used for personal, non-commercial playback; observe Spotify Developer Terms and Branding Guidelines.

## Official Spotify references

- [Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk)
- [Building a Spotify Player inside a Web app](https://developer.spotify.com/documentation/web-playback-sdk/howtos/web-app-player)
- [Spotify compliance tips](https://developer.spotify.com/compliance-tips)

## Verification

The GitHub Actions Playwright suite uses mocked Spotify OAuth/API/SDK responses and a generated local WAV file. It checks:
- Upgrade from the existing v1 IndexedDB schema without losing local tracks.
- Short audio import and playback, favorites, playlists and persistence after reload.
- Spotify embed host validation and official embed URL construction.
- PKCE callback/state validation, profile load, token refresh on 401, catalog search, playback request and disconnect.
- Mobile layout and uncaught JavaScript errors.

The browser suite does not use a real Spotify account or prove production Spotify Premium playback. A real account test is still required after the latest MATSONG deployment is available.
