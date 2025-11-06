/**
 * Convert a string to a URL-friendly slug
 * Example: "Drake's New Album" -> "drakes-new-album"
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

/**
 * Generate article URL with ID and slug combined
 * Example: (123, "Drake's New Album") -> "/article/123-drakes-new-album"
 */
export const generateArticleUrl = (id, title) => {
  const slug = slugify(title);
  return `/article/${id}-${slug}`;
};
