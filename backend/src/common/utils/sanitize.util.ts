// sanitize.util.ts - Input Sanitization Utility for XSS Protection
import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize string input to prevent XSS attacks
 * Removes all HTML tags and dangerous characters
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return input;
  }

  // Remove all HTML tags
  const sanitized = sanitizeHtml(input, {
    allowedTags: [], // No HTML allowed
    allowedAttributes: {},
    disallowedTagsMode: 'recursiveEscape',
  });

  // Additional security: escape special characters
  return sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Recursively sanitize all string values in an object
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as T;
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized as T;
  }

  return obj;
}
