/**
 * String utilities
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

/**
 * Indent multi-line string
 * @param str - String to indent
 * @param indent - Indentation string (default: '  ')
 * @param firstLine - Whether to indent first line (default: false)
 */
export function indent(
  str: string,
  indentStr: string = '  ',
  firstLine: boolean = false
): string {
  const lines = str.split('\n');

  if (firstLine) {
    return lines.map(line => indentStr + line).join('\n');
  }

  return lines
    .map((line, index) => (index === 0 ? line : indentStr + line))
    .join('\n');
}

/**
 * Truncate string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - Ellipsis string (default: '...')
 */
export function truncate(
  str: string,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (str.length <= maxLength) return str;

  const ellipsisLength = ellipsis.length;
  const truncateLength = maxLength - ellipsisLength;

  if (truncateLength <= 0) return ellipsis.slice(0, maxLength);

  return str.slice(0, truncateLength) + ellipsis;
}

/**
 * Escape HTML special characters
 * @param str - String to escape
 */
export function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return str.replace(/[&<>"']/g, char => htmlEntities[char] || char);
}

/**
 * Strip ANSI escape codes from string
 * @param str - String with ANSI codes
 */
export function stripAnsi(str: string): string {
  // ANSI escape sequence pattern
  const ansiPattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
  ].join('|');

  const regex = new RegExp(ansiPattern, 'g');
  return str.replace(regex, '');
}

/**
 * Word wrap text to specified width
 * @param str - String to wrap
 * @param width - Maximum line width
 * @param indent - Indentation for wrapped lines (default: '')
 * @param newline - Newline character (default: '\n')
 */
export function wordWrap(
  str: string,
  width: number,
  wrapIndent: string = '',
  newline: string = '\n'
): string {
  if (width <= 0) return str;

  const lines = str.split(newline);
  const wrapped: string[] = [];

  for (const line of lines) {
    if (line.length <= width) {
      wrapped.push(line);
      continue;
    }

    let remaining = line;

    while (remaining.length > width) {
      // Find last space before width
      let breakPoint = width;

      for (let i = width - 1; i >= 0; i--) {
        const char = remaining[i];
        if (char && /\s/.test(char)) {
          breakPoint = i + 1;
          break;
        }
      }

      // If no space found, break at width
      const charAtWidth = remaining[width - 1];
      if (breakPoint === width && charAtWidth && !/\s/.test(charAtWidth)) {
        // For first line, break at width
        if (wrapped.length === 0) {
          breakPoint = width;
        } else {
          breakPoint = width - wrapIndent.length;
        }
      }

      wrapped.push(remaining.slice(0, breakPoint).trimEnd());
      remaining = wrapIndent + remaining.slice(breakPoint).trimStart();
    }

    if (remaining.trim()) {
      wrapped.push(remaining);
    }
  }

  return wrapped.join(newline);
}

/**
 * Pad string to center
 * @param str - String to center
 * @param width - Total width
 * @param pad - Padding character (default: ' ')
 */
export function padCenter(str: string, width: number, pad: string = ' '): string {
  const padding = width - str.length;

  if (padding <= 0) return str;

  const left = Math.floor(padding / 2);
  const right = padding - left;

  return pad.repeat(left) + str + pad.repeat(right);
}

/**
 * Capitalize first letter
 * @param str - String to capitalize
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  const firstChar = str[0];
  return (firstChar ? firstChar.toUpperCase() : '') + str.slice(1);
}

/**
 * Convert kebab-case to camelCase
 * @param str - Kebab-case string
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to kebab-case
 * @param str - camelCase string
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Dedent multi-line string (remove leading indentation)
 * @param str - String to dedent
 */
export function dedent(str: string): string {
  const lines = str.split('\n');

  // Find minimum indentation
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim()) {
      const indent = line.match(/^\s*/)?.[0].length ?? 0;
      minIndent = Math.min(minIndent, indent);
    }
  }

  if (minIndent === Infinity || minIndent === 0) return str;

  // Remove minimum indentation from each line
  return lines
    .map(line => line.slice(minIndent))
    .join('\n');
}

/**
 * Count words in string
 * @param str - String to count words in
 */
export function countWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Repeat string n times
 * @param str - String to repeat
 * @param count - Number of times to repeat
 */
export function repeat(str: string, count: number): string {
  if (count <= 0) return '';
  return str.repeat(count);
}
