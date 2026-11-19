# MATSONG Next — Product & Design Brief

## Status
Independent rebuild branch: `matsong-next`.
The current production player at `projects/matsong/index.html` is protected and must not be replaced during this work.

## Competitive reference set
Primary music-product references:
- Apple Music — editorial hierarchy, album artwork, library, Now Playing.
- Spotify — discovery, search, artist/album/playlist information architecture.
- YouTube Music — search-led discovery and music/video context.
- TIDAL — premium presentation and high-fidelity positioning.
- Amazon Music — library, playlists, and cross-device continuity.

Cross-category interaction references:
- Apple — platform-native motion, clarity, accessibility, responsive behavior.
- Google Material 3 — coherent interaction states and accessible controls.
- Linear — restrained hierarchy, density, keyboard-friendly interaction.
- Airbnb — clear content hierarchy and confidence-building empty/loading states.

These are references, not templates to copy. Use current official product behavior and competitor evidence when making specific claims.

## Product principles
1. Keep local audio playback and the IndexedDB library.
2. Treat Spotify as an integration, not as unrestricted audio hosting. Clearly distinguish catalog search, Spotify embeds, and any playback capability requiring account eligibility or Premium.
3. Make discovery useful even before a user connects an account.
4. Use artist/album artwork only from legitimate metadata/image sources; do not fabricate a current global Top 10.
5. Design for mobile first, with desktop layouts that feel intentional rather than stretched.
6. Respect reduced-motion preferences, keyboard access, focus states, and readable contrast.
7. Do not store Spotify client secrets in browser code. Use PKCE for public-client authorization; move privileged operations server-side if required.

## Proposed information architecture
- Home: editorial discovery, recently played, featured mixes.
- Search: query, filters, results grouped by track / artist / album / playlist.
- Library: local tracks, saved items, albums, playlists, favorites.
- Artist: image, bio/metadata, popular tracks, releases.
- Now Playing: artwork, queue, lyrics area (only where licensed/available), audio-reactive visualizer for local playback.
- Connect: Spotify account state, embed support, clear capability explanation.
- Settings: appearance, playback, privacy, accessibility.

## Visual direction
A refined, warm-neutral / graphite music environment with expressive artwork doing most of the color work. Avoid forcing the MAT-STUDIO accent onto album art or every control. Use restrained accent color, layered surfaces, generous spacing, subtle depth, and short spring-like transitions. The approved “Your Music. Your World.” Sharable concept remains the visual north star; this branch is a fresh implementation, not a claim that its original source was recovered.

## Acceptance gates
- No change to production until an independently hosted preview is reviewed.
- Test responsive layouts, local import/playback, IndexedDB persistence, queue, seek, volume, favorites, and reduced motion.
- Test Spotify login/session restoration and embed behavior against actual Spotify account/app restrictions.
- Verify all buttons, empty states, loading states, errors, and browser console.
- Compare the result against the reference set using a documented rubric; report measured findings rather than invented percentages.

## Known issues in current production source to address during rebuild
- The navigation includes a literal escaped newline artifact before the Spotify item.
- A similar escaped newline artifact appears near the audio event listeners.
- Spotify integration currently provides account sign-in and an official embed; it does not provide unrestricted full-catalog in-app streaming.
- The current page mixes multiple global theme overrides, creating a fragile cascade.
- The current local player has no actual audio-reactive visualizer.
