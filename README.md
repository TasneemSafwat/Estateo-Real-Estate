# Estateo — real estate platform (React + TypeScript + Vite)

## Run
```bash
npm install
npm run dev
```

## What changed in this version
- **Palette**: deep petrol teal (`brand`) + saffron amber (`accent`) + cool neutrals (`mist`). All colors are tokens in `tailwind.config.js` and `src/styles/index.css` (light and dark).
- **Real photos only**: `src/utils/images.ts` uses curated Unsplash photo ids. Nothing is AI-generated. If a photo fails, `ImageWithFallback` swaps to another real photo, then to a neutral placeholder.
- **3D (no extra dependency)**: `src/components/three-d/` — `Building3D` (draggable CSS-3D city block in the hero) and `TiltCard` (pointer-reactive 3D tilt on cards). Both respect `prefers-reduced-motion`.
- **Fixes**: Tailwind opacity steps like `/12`, `/82`, `/92` generated no CSS before; all steps 0–100 now work. Missing `favicon.svg` added. Land/office listings no longer show living-room photos. Playwright uses bundled Chromium (set `E2E_CHANNEL=msedge` to use Edge).

## Video commerce (Reels)
Route `/reels`, linked from the navbar and a teaser section on the home page.
- Full-screen vertical scroll-snap feed. Each reel has price, estimated monthly payment, advisor (call), favorite, compare, share, **Book a viewing** (opens the existing viewing form) and a link to the full listing.
- Photo tours by default: real photos with slow camera moves, story-style progress, tap left/right to move, hold to pause. Keyboard: arrows / J / K to move, M to mute.
- Real video: put an `.mp4` in `public/videos/` and map it to the property id in `src/services/mock/reelVideos.ts`. If a video fails, the reel falls back to the photo tour.
- The monthly payment is an illustration (20% down, 6.5%, 30 years), see `src/utils/mortgage.ts`.

## Defaults and Arabic content
- Dark theme is the default (`DEFAULT_PREFERENCES` in `src/services/mock/users.data.ts`, plus an inline script in `index.html` that avoids a light flash). A theme the visitor already chose is kept.
- Listings are translated through `src/utils/localize.ts` and the hooks in `src/hooks/useLocalized.ts`: titles and descriptions (written into each seeded listing under `translations.ar`), cities, districts, countries, street addresses and advisor names, roles and bios. Text typed by an admin in English is shown as written; Arabic is only used while the English it was written for is unchanged.
