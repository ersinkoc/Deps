/**
 * Tests for file system utilities
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  readFile,
  readFileSafe,
  readJson,
  writeFile,
  writeJson,
  fileExists,
  fileExistsSync,
  directoryExists,
  listFiles,
  listDirectories,
  getFileHash,
  getDirectoryHash,
  getFileSize,
  getDirectorySize
} from '../../../src/utils/fs.js';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { FileSystemError } from '../../../src/errors.js';

const testDir = join(process.cwd(), 'test-fs-temp');
const testFile = join(testDir, 'test.txt');
const testJsonFile = join(testDir, 'test.json');
const testSubDir = join(testDir, 'subdir');

describe('readFile', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testFile, 'test content', 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should read file content', async () => {
    const content = await readFile(testFile);
    expect(content).toBe('test content');
  });

  it('should throw FileSystemError on missing file', async () => {
    await expect(readFile(join(testDir, 'missing.txt'))).rejects.toThrow(FileSystemError);
  });

  it('should use custom encoding', async () => {
    await fs.writeFile(join(testDir, 'binary.txt'), Buffer.from('test'), 'binary');
    const content = await readFile(join(testDir, 'binary.txt'), 'binary');
    expect(content).toBe('test');
  });
});

describe('readFileSafe', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testFile, 'test content', 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should read file content', async () => {
    const content = await readFileSafe(testFile);
    expect(content).toBe('test content');
  });

  it('should return undefined for missing file', async () => {
    const content = await readFileSafe(join(testDir, 'missing.txt'));
    expect(content).toBeUndefined();
  });
});

describe('readJson', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testJsonFile, JSON.stringify({ test: 'value' }), 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should parse JSON file', async () => {
    const data = await readJson<{ test: string }>(testJsonFile);
    expect(data).toEqual({ test: 'value' });
  });

  it('should throw on invalid JSON', async () => {
    await fs.writeFile(join(testDir, 'invalid.json'), 'invalid json', 'utf-8');
    await expect(readJson(join(testDir, 'invalid.json'))).rejects.toThrow();
  });

  it('should throw FileSystemError on missing file', async () => {
    await expect(readJson(join(testDir, 'missing.json'))).rejects.toThrow(FileSystemError);
  });
});

describe('writeFile', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should write file content', async () => {
    await writeFile(testFile, 'new content');
    const content = await fs.readFile(testFile, 'utf-8');
    expect(content).toBe('new content');
  });

  it('should create directory if not exists', async () => {
    const nestedFile = join(testDir, 'nested', 'file.txt');
    await writeFile(nestedFile, 'content');
    const exists = await fs.access(nestedFile).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('should write file atomically', async () => {
    await writeFile(testFile, 'atomic content');
    const content = await fs.readFile(testFile, 'utf-8');
    expect(content).toBe('atomic content');
  });

  it('should throw FileSystemError on write failure', async () => {
    // Test error handling path in lines 92-97
    // Create a directory with the same name as the file to cause write failure
    await fs.mkdir(testFile, { recursive: true });

    await expect(writeFile(testFile, 'content', 'utf-8')).rejects.toThrow(FileSystemError);
  });
});

describe('writeJson', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should write JSON file', async () => {
    await writeJson(testJsonFile, { test: 'value' });
    const content = await fs.readFile(testJsonFile, 'utf-8');
    expect(JSON.parse(content)).toEqual({ test: 'value' });
  });

  it('should use custom indent', async () => {
    await writeJson(testJsonFile, { test: 'value' }, 4);
    const content = await fs.readFile(testJsonFile, 'utf-8');
    expect(content).toContain('    "test"');
  });
});

describe('fileExists', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testFile, 'content', 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should return true for existing file', async () => {
    const exists = await fileExists(testFile);
    expect(exists).toBe(true);
  });

  it('should return false for missing file', async () => {
    const exists = await fileExists(join(testDir, 'missing.txt'));
    expect(exists).toBe(false);
  });
});

describe('fileExistsSync', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testFile, 'content', 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should return true for existing file', () => {
    const exists = fileExistsSync(testFile);
    expect(exists).toBe(true);
  });

  it('should return false for missing file', () => {
    const exists = fileExistsSync(join(testDir, 'missing.txt'));
    expect(exists).toBe(false);
  });
});

describe('directoryExists', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testFile, 'content', 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should return true for existing directory', async () => {
    const exists = await directoryExists(testDir);
    expect(exists).toBe(true);
  });

  it('should return false for file', async () => {
    const exists = await directoryExists(testFile);
    expect(exists).toBe(false);
  });

  it('should return false for missing directory', async () => {
    const exists = await directoryExists(join(testDir, 'missing'));
    expect(exists).toBe(false);
  });
});

describe('listFiles', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(testSubDir, { recursive: true });
    await fs.writeFile(join(testDir, 'file1.txt'), 'content1', 'utf-8');
    await fs.writeFile(join(testDir, 'file2.txt'), 'content2', 'utf-8');
    await fs.writeFile(join(testSubDir, 'file3.txt'), 'content3', 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should list files in directory', async () => {
    const files = await listFiles(testDir);
    expect(files).toHaveLength(2);
    expect(files.some(f => f.endsWith('file1.txt'))).toBe(true);
    expect(files.some(f => f.endsWith('file2.txt'))).toBe(true);
  });

  it('should list files recursively', async () => {
    const files = await listFiles(testDir, true);
    expect(files).toHaveLength(3);
    expect(files.some(f => f.endsWith('file3.txt'))).toBe(true);
  });

  it('should throw FileSystemError on missing directory', async () => {
    await expect(listFiles(join(testDir, 'missing'))).rejects.toThrow(FileSystemError);
  });
});

describe('listDirectories', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(join(testDir, 'dir1'), { recursive: true });
    await fs.mkdir(join(testDir, 'dir2'), { recursive: true });
    await fs.writeFile(join(testDir, 'file.txt'), 'content', 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should list directories only', async () => {
    const dirs = await listDirectories(testDir);
    expect(dirs).toHaveLength(2);
    expect(dirs.some(d => d.endsWith('dir1'))).toBe(true);
    expect(dirs.some(d => d.endsWith('dir2'))).toBe(true);
    expect(dirs.some(d => d.endsWith('file.txt'))).toBe(false);
  });

  it('should throw FileSystemError on missing directory', async () => {
    await expect(listDirectories(join(testDir, 'missing'))).rejects.toThrow(FileSystemError);
  });
});

describe('getFileHash', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testFile, 'test content', 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should calculate md5 hash', async () => {
    const hash = await getFileHash(testFile, 'md5');
    expect(hash).toHaveLength(32);
    expect(hash).toMatch(/^[a-f0-9]{32}$/);
  });

  it('should calculate sha1 hash', async () => {
    const hash = await getFileHash(testFile, 'sha1');
    expect(hash).toHaveLength(40);
  });

  it('should calculate sha256 hash', async () => {
    const hash = await getFileHash(testFile, 'sha256');
    expect(hash).toHaveLength(64);
  });

  it('should throw FileSystemError on missing file', async () => {
    await expect(getFileHash(join(testDir, 'missing.txt'))).rejects.toThrow(FileSystemError);
  });

  it('should return consistent hash for same content', async () => {
    const hash1 = await getFileHash(testFile);
    const hash2 = await getFileHash(testFile);
    expect(hash1).toBe(hash2);
  });
});

describe('getDirectoryHash', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(join(testDir, 'subdir'), { recursive: true });
    await fs.writeFile(join(testDir, 'file1.txt'), 'content1', 'utf-8');
    await fs.writeFile(join(testDir, 'subdir', 'file2.txt'), 'content2', 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should calculate directory hash', async () => {
    const hash = await getDirectoryHash(testDir);
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');
  });

  it('should return consistent hash for same directory', async () => {
    const hash1 = await getDirectoryHash(testDir);
    const hash2 = await getDirectoryHash(testDir);
    expect(hash1).toBe(hash2);
  });

  it('should throw FileSystemError on missing directory', async () => {
    await expect(getDirectoryHash(join(testDir, 'missing'))).rejects.toThrow(FileSystemError);
  });
});

describe('getFileSize', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testFile, 'test content', 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should return file size in bytes', async () => {
    const size = await getFileSize(testFile);
    expect(size).toBe(12); // 'test content' = 12 bytes
  });

  it('should throw FileSystemError on missing file', async () => {
    await expect(getFileSize(join(testDir, 'missing.txt'))).rejects.toThrow(FileSystemError);
  });
});

describe('getDirectorySize', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(join(testDir, 'subdir'), { recursive: true });
    await fs.writeFile(join(testDir, 'file1.txt'), 'content1', 'utf-8');
    await fs.writeFile(join(testDir, 'subdir', 'file2.txt'), 'content2', 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should calculate total directory size', async () => {
    const size = await getDirectorySize(testDir);
    expect(size).toBe(16); // 'content1' (8) + 'content2' (8)
  });

  it('should throw FileSystemError on missing directory', async () => {
    await expect(getDirectorySize(join(testDir, 'missing'))).rejects.toThrow(FileSystemError);
  });
});
