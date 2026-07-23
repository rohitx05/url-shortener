/**
 * Validates whether a given string is a valid HTTP or HTTPS URL.
 * Rejects invalid URLs like 'hello', 'google', 'ftp://...', 'javascript:...'.
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates a shortCode parameter.
 * Allows only alphanumeric characters, hyphens, and underscores.
 */
export function isValidShortCode(shortCode: string): boolean {
  if (!shortCode || typeof shortCode !== "string") {
    return false;
  }

  const shortCodeRegex = /^[a-zA-Z0-9_-]+$/;
  return shortCodeRegex.test(shortCode);
}
