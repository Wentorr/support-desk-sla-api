const PUBLIC_ID_PATTERN = /^[a-z0-9_-]{8,64}$/i;

export function isPublicId(value: string) {
  return PUBLIC_ID_PATTERN.test(value);
}

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

