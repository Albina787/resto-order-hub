/**
 * Image URL resolution for RestoOrderHub.
 *
 * Strategy:
 * - For next/image: use RELATIVE path /images/... so Next.js rewrite proxies it
 *   to backend:8080/images/... server-side. This avoids localhost:8080 issues in Docker.
 * - For plain <img> tags: same relative path works in browser via rewrite.
 *
 * Backend stores image URLs as: /images/restaurants/smak/restaurant-1.jpg
 * next.config.ts rewrites: /images/:path* → http://backend:8080/images/:path*
 */

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  // Already absolute external URL — use as-is
  if (url.startsWith("https://")) return url;
  // Already absolute http — convert to relative if it's our backend
  if (url.startsWith("http://")) {
    try {
      const parsed = new URL(url);
      // Strip host, keep path — becomes relative, handled by rewrite
      return parsed.pathname;
    } catch {
      return url;
    }
  }
  // Already relative /images/... — use as-is (rewrite handles it)
  return url;
}

/**
 * Backend stores images as a JSON string: "[\"url1\", \"url2\"]"
 * Safely parses whether it's already an array or a JSON string.
 */
export function parseImages(images: string[] | string | null | undefined): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    if (typeof images === "string" && images.startsWith("/")) return [images];
    return [];
  }
}

export function getFirstImage(images: string[] | string | null | undefined): string {
  const arr = parseImages(images);
  if (arr.length === 0) return "";
  return resolveImageUrl(arr[0]);
}

export const PLACEHOLDER_IMAGE = "/images/placeholders/placeholder.jpg";

export function resolveOrPlaceholder(url: string | null | undefined): string {
  const resolved = resolveImageUrl(url);
  return resolved || PLACEHOLDER_IMAGE;
}
