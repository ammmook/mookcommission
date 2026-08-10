/**
 * Artwork served from the public `ILLUSTRATION` bucket.
 *
 * Built from `NEXT_PUBLIC_SUPABASE_URL` rather than a pasted absolute URL, so
 * pointing the app at another Supabase project moves the images with it. Null
 * when Supabase is not configured — callers fall back to the hatch placeholder.
 */

const base = process.env.NEXT_PUBLIC_SUPABASE_URL;

function bucketUrl(path: string): string | null {
  return base ? `${base}/storage/v1/object/public/ILLUSTRATION/${path}` : null;
}

/** The illustration used on the landing hero and the admin login screen. */
export const HERO_ILLUSTRATION = bucketUrl("IMG_5345.PNG");
