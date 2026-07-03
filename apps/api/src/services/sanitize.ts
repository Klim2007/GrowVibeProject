import sanitizeHtml from "sanitize-html";

const STRIP_ALL_TAGS: sanitizeHtml.IOptions = { allowedTags: [], allowedAttributes: {} };

export function sanitizeText(value: string): string {
  return sanitizeHtml(value, STRIP_ALL_TAGS).trim();
}

export function sanitizeOptionalText(value: string | undefined): string | undefined {
  return value === undefined ? undefined : sanitizeText(value);
}
