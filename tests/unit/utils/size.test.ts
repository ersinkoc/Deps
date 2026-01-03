/**
 * Tests for size utilities
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import {
  formatBytes,
  parseSize,
  calculatePercentage,
  compareSizeStrings,
  isValidSizeString,
  getDirectorySizeFormatted,
  getFileSizeFormatted
} from '../../../src/utils/size.js';

describe('formatBytes', () => {
  it('should format zero bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('should format bytes', () => {
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(2048)).toBe('2 KB');
  });

  it('should format megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });

  it('should format gigabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('should format terabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
  });

  it('should handle decimals parameter', () => {
    expect(formatBytes(1536, 0)).toBe('2 KB');
    expect(formatBytes(1536, 1)).toBe('1.5 KB');
    expect(formatBytes(1536, 3)).toBe('1.5 KB');
  });
});

describe('parseSize', () => {
  it('should parse bytes', () => {
    expect(parseSize('500')).toBe(500);
    expect(parseSize('500B')).toBe(500);
    expect(parseSize('500 B')).toBe(500);
  });

  it('should parse kilobytes', () => {
    expect(parseSize('1KB')).toBe(1024);
    expect(parseSize('1.5 KB')).toBe(1536);
  });

  it('should parse megabytes', () => {
    expect(parseSize('1MB')).toBe(1024 * 1024);
    expect(parseSize('2.5 MB')).toBe(2.62144e6);
  });

  it('should parse gigabytes', () => {
    expect(parseSize('1GB')).toBe(1024 * 1024 * 1024);
  });

  it('should parse terabytes', () => {
    expect(parseSize('1TB')).toBe(1024 * 1024 * 1024 * 1024);
  });

  it('should handle uppercase and lowercase', () => {
    expect(parseSize('1kb')).toBe(1024);
    expect(parseSize('1MB')).toBe(1024 * 1024);
    expect(parseSize('1 GB')).toBe(1024 * 1024 * 1024);
  });

  it('should throw on invalid format', () => {
    expect(() => parseSize('invalid')).toThrow();
    expect(() => parseSize('1XB')).toThrow();
  });

  it('should throw on invalid unit', () => {
    expect(() => parseSize('1PB')).toThrow();
  });

  it('should throw on invalid value', () => {
    expect(() => parseSize('abc KB')).toThrow();
  });
});

describe('calculatePercentage', () => {
  it('should calculate percentage', () => {
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(25, 200)).toBe(12.5);
    expect(calculatePercentage(100, 100)).toBe(100);
  });

  it('should return 0 when total is 0', () => {
    expect(calculatePercentage(50, 0)).toBe(0);
  });

  it('should handle decimals correctly', () => {
    expect(calculatePercentage(1, 3)).toBe(33.33);
  });
});

describe('compareSizeStrings', () => {
  it('should return -1 when first is smaller', () => {
    expect(compareSizeStrings('500KB', '1MB')).toBe(-1);
    expect(compareSizeStrings('1MB', '2MB')).toBe(-1);
  });

  it('should return 0 when equal', () => {
    expect(compareSizeStrings('1MB', '1MB')).toBe(0);
    expect(compareSizeStrings('1024KB', '1MB')).toBe(0);
  });

  it('should return 1 when first is larger', () => {
    expect(compareSizeStrings('2MB', '1MB')).toBe(1);
    expect(compareSizeStrings('1.5GB', '500MB')).toBe(1);
  });
});

describe('isValidSizeString', () => {
  it('should validate correct size strings', () => {
    expect(isValidSizeString('500')).toBe(true);
    expect(isValidSizeString('1KB')).toBe(true);
    expect(isValidSizeString('1.5 MB')).toBe(true);
    expect(isValidSizeString('1GB')).toBe(true);
  });

  it('should reject invalid size strings', () => {
    expect(isValidSizeString('invalid')).toBe(false);
    expect(isValidSizeString('1PB')).toBe(false);
    expect(isValidSizeString('')).toBe(false);
  });
});

describe('getDirectorySizeFormatted', () => {
  const testDir = join(process.cwd(), 'test-size-formatted-temp');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should return bytes and formatted string', async () => {
    // Create a test file
    const testFile = join(testDir, 'test.txt');
    await fs.writeFile(testFile, 'test content', 'utf-8');

    const result = await getDirectorySizeFormatted(testDir);

    expect(result.bytes).toBeGreaterThan(0);
    expect(typeof result.formatted).toBe('string');
    expect(result.formatted).toContain('B');
  });

  it('should handle empty directory', async () => {
    const result = await getDirectorySizeFormatted(testDir);

    expect(result.bytes).toBe(0);
    expect(result.formatted).toBe('0 B');
  });
});

describe('getFileSizeFormatted', () => {
  const testDir = join(process.cwd(), 'test-size-file-temp');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should return bytes and formatted string', async () => {
    const testFile = join(testDir, 'test.txt');
    await fs.writeFile(testFile, 'test content for size', 'utf-8');

    const result = await getFileSizeFormatted(testFile);

    expect(result.bytes).toBeGreaterThan(0);
    expect(typeof result.formatted).toBe('string');
    expect(result.formatted).toContain('B');
  });

  it('should handle different file sizes', async () => {
    const smallFile = join(testDir, 'small.txt');
    await fs.writeFile(smallFile, 'x', 'utf-8');

    const result = await getFileSizeFormatted(smallFile);
    expect(result.bytes).toBe(1);
    expect(result.formatted).toBe('1 B');
  });
});
