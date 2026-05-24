/**
 * lib/markdown.ts
 *
 * Centralized markdown configuration for react-markdown.
 * Used by MessageBubble and any other place that renders markdown.
 */

import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

/** Remark plugins shared across the app */
export const remarkPlugins = [remarkGfm];

/** Rehype plugins shared across the app */
export const rehypePlugins = [rehypeHighlight];

/**
 * Detects markdown-like patterns in a string.
 * Used to decide whether to render with react-markdown or plain text.
 */
export function hasMarkdown(text: string): boolean {
  const patterns = [
    /#{1,6}\s/,          // headings
    /\*\*[^*]+\*\*/,     // bold
    /`[^`]+`/,           // inline code
    /```[\s\S]+```/,     // code block
    /^\s*[-*+]\s/m,      // unordered list
    /^\s*\d+\.\s/m,      // ordered list
    /\[.+\]\(.+\)/,      // links
    /^\|.+\|/m,          // table
  ];
  return patterns.some((p) => p.test(text));
}

/**
 * Strips markdown formatting from a string.
 * Used for TTS output — we don't want to speak "double asterisk bold double asterisk".
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, 'bloco de código')
    .replace(/`[^`]+`/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/>\s/g, '')
    .replace(/\|[^|\n]+\|/g, '')
    .replace(/^[-|:\s]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n{2}/g, '. ')
    .replace(/\n/g, ' ')
    .trim();
}
