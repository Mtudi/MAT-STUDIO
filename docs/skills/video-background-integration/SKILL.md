---
name: Video Background Integration
slug: video-background-integration
description: Integrate cinematic video backgrounds into websites with polished glassmorphism overlays, responsive behavior, accessibility, and performance safeguards. Trigger when the user asks to add a background video, cinematic hero, video wallpaper, or glass video section to any website.
version: 1.0.0
---

# Video Background Integration

## Goal

Add a cinematic, high-quality video background to an existing website while preserving its identity, readability, responsiveness, accessibility, and performance. Use this method across any user website when explicitly requested. Do not assume every page needs glassmorphism; apply it where it supports the visual direction.

## Workflow

1. Audit the target page and existing design before editing. Identify the hero/container, layout constraints, current media assets, framework, and mobile behavior.
2. Inspect the requested video source and confirm it is usable. Prefer a direct, authorized MP4/WebM asset or a suitable CDN-hosted file for production. Use YouTube/Vimeo embeds only when the user wants that source or direct media is unavailable; respect platform branding, embed rules, attribution, and copyright.
3. Build a layered hero:
   - video layer at the back, covering the intended container;
   - gradient/scrim overlay to protect text contrast;
   - foreground content and optional glass panel;
   - optional subtle border, blur, and shadow.
4. Keep the existing site content and interactions intact unless the user requests broader redesign.
5. Validate desktop and mobile layouts, loading behavior, contrast, keyboard/accessibility, and reduced-motion behavior.

## Direct video implementation

For a self-hosted or authorized direct video URL, use a semantic video element:

```html
<section class="video-hero">
  <video class="video-hero__media"
         autoplay muted loop playsinline
         preload="metadata"
         poster="/media/hero-poster.webp"
         aria-hidden="true">
    <source src="/media/hero-video.webm" type="video/webm">
    <source src="/media/hero-video.mp4" type="video/mp4">
  </video>

  <div class="video-hero__scrim" aria-hidden="true"></div>

  <div class="video-hero__content">
    <div class="glass-panel">
      <p class="eyebrow">Optional eyebrow</p>
      <h1>Headline</h1>
      <p>Supporting copy</p>
      <a href="#explore">Explore</a>
    </div>
  </div>
</section>
```

```css
.video-hero {
  position: relative;
  isolation: isolate;
  min-height: min(88svh, 900px);
  overflow: hidden;
  background: #09090b;
}
.video-hero__media,
.video-hero__scrim {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.video-hero__media {
  z-index: -2;
  object-fit: cover;
  object-position: center;
}
.video-hero__scrim {
  z-index: -1;
  background:
    linear-gradient(90deg, rgb(0 0 0 / .72), rgb(0 0 0 / .16)),
    linear-gradient(0deg, rgb(0 0 0 / .42), transparent 55%);
}
.video-hero__content {
  min-height: inherit;
  display: grid;
  align-items: center;
  padding: clamp(1.25rem, 5vw, 5rem);
}
.glass-panel {
  width: min(100%, 620px);
  padding: clamp(1.25rem, 3vw, 2.5rem);
  color: #fff;
  background: rgb(15 15 18 / .38);
  border: 1px solid rgb(255 255 255 / .18);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgb(0 0 0 / .24);
  -webkit-backdrop-filter: blur(18px) saturate(125%);
  backdrop-filter: blur(18px) saturate(125%);
}
@media (max-width: 640px) {
  .video-hero { min-height: 78svh; }
  .video-hero__media { object-position: center; }
  .video-hero__scrim {
    background: linear-gradient(0deg, rgb(0 0 0 / .72), rgb(0 0 0 / .12));
  }
}
@media (prefers-reduced-motion: reduce) {
  .video-hero__media { display: none; }
}
```

Adapt the selectors, content, dimensions, colors, and positioning to the actual project rather than blindly pasting this sample. If reduced motion is requested, provide a poster/static background and do not autoplay moving media.

## YouTube / Vimeo background

- Use the official embed/player mechanism, not a scraped stream or extracted media URL.
- Typical YouTube background parameters may include autoplay=1, mute=1, controls=0, loop=1, playlist=<same-video-id>, and playsinline=1.
- Autoplay generally requires muted playback and can still vary by browser/device. Never promise autoplay will work on every device.
- Keep the iframe responsive with a cover-style wrapper; account for aspect ratio/cropping and possible player UI or branding.
- Use a fallback poster/image and a clear path to play the video with controls if autoplay is blocked.
- Do not remove required attribution, platform UI, or branding, and do not bypass embed restrictions.

## Performance and accessibility gates

- Prefer short, compressed, appropriately encoded assets; use WebM plus MP4 fallback when practical.
- Avoid huge 4K files for mobile. Provide a mobile-specific source or static poster when beneficial.
- Use preload="metadata" or a more conservative strategy; do not eagerly download large media on pages where it is not needed.
- Keep only one active background video per view. Pause or remove media when its section/modal is no longer active where applicable.
- Avoid unnecessary filters over the full video; blur the foreground glass panel, not the entire video.
- Ensure text contrast remains strong over every frame; overlays must be tested against bright scenes.
- Respect prefers-reduced-motion and provide a static fallback.
- Video is decorative: hide it from assistive technology with aria-hidden="true"; keep meaningful text outside the video element.
- Ensure controls and links remain keyboard accessible and visible focus states are retained.
- Test on real mobile browsers when available; check data usage, thermal/battery impact, and layout shifts.

## QA checklist

- [ ] Existing project audited before changes.
- [ ] Video source and usage rights checked.
- [ ] Hero layering and z-index verified.
- [ ] Text contrast remains readable across the clip.
- [ ] Glass effect has a graceful fallback when backdrop-filter is unsupported.
- [ ] Mobile crop, height, and foreground layout checked.
- [ ] Autoplay fallback and poster checked.
- [ ] Reduced-motion behavior checked.
- [ ] Performance and media size reviewed.
- [ ] Browser testing performed where available; clearly report any untested devices or browsers.

## Invocation

When the user says "جيبلي طريقة الفيديو بالخلفية", "أضف فيديو بالخلفية", "cinematic video hero", or asks to reuse this method, apply this skill to the named website. First inspect the current project; do not overwrite or redesign unrelated areas. Ask for the video URL only if it is not already supplied or available in context.
