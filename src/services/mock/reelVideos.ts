/**
 * Optional real video per listing.
 *
 * Reels play the property's photography as a cinematic tour by default. To use
 * real footage for a listing, drop an .mp4 into `public/videos/` and map the
 * property id here, e.g.
 *
 *   'prop-001': { src: '/videos/prop-001.mp4', poster: '/videos/prop-001.jpg' },
 *
 * If a video fails to load, the reel falls back to the photo tour on its own.
 */
export interface ReelVideo {
  src: string;
  poster?: string;
}

export const REEL_VIDEOS: Record<string, ReelVideo> = {};
