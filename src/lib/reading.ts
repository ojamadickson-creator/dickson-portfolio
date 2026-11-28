/**
 * Reading time for a post body.
 *
 * Posts with screenshots and video carry a lot of markup in `body`, and image
 * URLs are not words. Strip tags and image syntax before counting so the card
 * and the article agree with each other.
 */
export function countWords(body: string | undefined): number {
  const text = (body ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  return text.split(/\s+/).filter(Boolean).length;
}

export function readingTime(body: string | undefined, wordsPerMinute = 200): number {
  return Math.max(1, Math.round(countWords(body) / wordsPerMinute));
}
