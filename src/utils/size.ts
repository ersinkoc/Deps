/**
 * Size formatting and parsing utilities
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import { getDirectorySize, getFileSize } from './fs.js';

/**
 * Size units for formatting
 */
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/**
 * Format bytes to human-readable string
 * @param bytes - Size in bytes
 * @param decimals - Number of decimals (default: 2)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

  const unit = SIZE_UNITS[i] ?? SIZE_UNITS[SIZE_UNITS.length - 1];
  const value = Number((bytes / Math.pow(k, i)).toFixed(dm));

  return `${value} ${unit}`;
}

/**
 * Parse size string to bytes
 * @param size - Size string (e.g., '500kb', '2.5 MB', '1GB')
 */
export function parseSize(size: string): number {
  const trimmed = size.trim().toUpperCase();

  // Match number and unit
  const match = trimmed.match(/^([\d.]+)\s*([A-Z]*)?$/);

  if (!match || !match[1]) {
    throw new Error(`Invalid size format: ${size}`);
  }

  const value = parseFloat(match[1]);
  const unit = match[2] || 'B';

  if (isNaN(value)) {
    throw new Error(`Invalid size value: ${size}`);
  }

  const unitIndex = SIZE_UNITS.findIndex(u => u === unit);

  if (unitIndex === -1) {
    throw new Error(`Unknown size unit: ${unit}`);
  }

  return value * Math.pow(1024, unitIndex);
}

/**
 * Get directory size and format it
 * @param path - Directory path
 */
export async function getDirectorySizeFormatted(
  path: string
): Promise<{ bytes: number; formatted: string }> {
  const bytes = await getDirectorySize(path);
  return {
    bytes,
    formatted: formatBytes(bytes)
  };
}

/**
 * Get file size and format it
 * @param path - File path
 */
export async function getFileSizeFormatted(
  path: string
): Promise<{ bytes: number; formatted: string }> {
  const bytes = await getFileSize(path);
  return {
    bytes,
    formatted: formatBytes(bytes)
  };
}

/**
 * Calculate percentage of total size
 * @param value - Size value
 * @param total - Total size
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 10000) / 100;
}

/**
 * Compare two size strings
 * @param size1 - First size string
 * @param size2 - Second size string
 * @returns -1 if size1 < size2, 0 if equal, 1 if size1 > size2
 */
export function compareSizeStrings(size1: string, size2: string): number {
  const bytes1 = parseSize(size1);
  const bytes2 = parseSize(size2);

  if (bytes1 < bytes2) return -1;
  if (bytes1 > bytes2) return 1;
  return 0;
}

/**
 * Validate size string format
 * @param size - Size string to validate
 */
export function isValidSizeString(size: string): boolean {
  try {
    parseSize(size);
    return true;
  } catch {
    return false;
  }
}
