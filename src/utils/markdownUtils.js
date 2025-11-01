/**
 * Strip markdown formatting from text for plain text previews
 * @param {string} markdown - The markdown text to strip
 * @returns {string} - Plain text without markdown formatting
 */
export const stripMarkdown = (markdown) => {
  if (!markdown) return '';

  let text = markdown;

  // Remove headers
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove bold
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/__(.+?)__/g, '$1');

  // Remove italic
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/_(.+?)_/g, '$1');

  // Remove strikethrough
  text = text.replace(/~~(.+?)~~/g, '$1');

  // Remove inline code
  text = text.replace(/`(.+?)`/g, '$1');

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');

  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');

  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '');

  // Remove unordered list markers
  text = text.replace(/^\s*[-*+]\s+/gm, '');

  // Remove ordered list markers
  text = text.replace(/^\s*\d+\.\s+/gm, '');

  // Remove horizontal rules
  text = text.replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '');

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Clean up extra whitespace
  text = text.replace(/\n\n+/g, ' ');
  text = text.replace(/\n/g, ' ');
  text = text.trim();

  return text;
};
