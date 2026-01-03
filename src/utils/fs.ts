/**
 * File system utilities
 *
 * Zero-dependency implementation using Node.js fs module
 *
 * @packageDocumentation
 */

import { promises as fs, constants, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { FileSystemError } from '../errors.js';

/**
 * Read a file with encoding
 * @param path - File path
 * @param encoding - File encoding (default: 'utf-8')
 */
export async function readFile(
  path: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<string> {
  try {
    return await fs.readFile(path, encoding);
  } catch (error) {
    throw new FileSystemError(
      `Failed to read file: ${path}`,
      path,
      error as Error
    );
  }
}

/**
 * Read a file safely, return undefined if not found
 * @param path - File path
 * @param encoding - File encoding (default: 'utf-8')
 */
export async function readFileSafe(
  path: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<string | undefined> {
  try {
    return await fs.readFile(path, encoding);
  } catch {
    return undefined;
  }
}

/**
 * Read and parse a JSON file
 * @param path - File path
 */
export async function readJson<T = unknown>(path: string): Promise<T> {
  try {
    const content = await readFile(path);
    return JSON.parse(content) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw error;
    }
    throw new FileSystemError(
      `Failed to read JSON file: ${path}`,
      path,
      error as Error
    );
  }
}

/**
 * Write a file with atomic operation (write to temp, then rename)
 * @param path - File path
 * @param content - File content
 * @param encoding - File encoding (default: 'utf-8')
 */
export async function writeFile(
  path: string,
  content: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<void> {
  try {
    // Ensure directory exists
    const dir = dirname(path);
    await fs.mkdir(dir, { recursive: true });

    // Write to temp file first
    const tempPath = `${path}.tmp`;
    await fs.writeFile(tempPath, content, encoding);

    // Atomic rename
    await fs.rename(tempPath, path);
  } catch (error) {
    throw new FileSystemError(
      `Failed to write file: ${path}`,
      path,
      error as Error
    );
  }
}

/**
 * Write a JSON file
 * @param path - File path
 * @param data - Data to write
 * @param indent - JSON indentation (default: 2)
 */
export async function writeJson(
  path: string,
  data: unknown,
  indent: number | string = 2
): Promise<void> {
  const content = JSON.stringify(data, null, indent);
  await writeFile(path, content);
}

/**
 * Check if a file exists
 * @param path - File path
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a file exists synchronously
 * @param path - File path
 */
export function fileExistsSync(path: string): boolean {
  return existsSync(path);
}

/**
 * Check if a directory exists
 * @param path - Directory path
 */
export async function directoryExists(path: string): Promise<boolean> {
  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * List files in a directory
 * @param path - Directory path
 * @param recursive - Whether to list recursively (default: false)
 */
export async function listFiles(
  path: string,
  recursive: boolean = false
): Promise<string[]> {
  try {
    const entries = await fs.readdir(path, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = join(path, entry.name);

      if (entry.isFile()) {
        files.push(fullPath);
      } else if (entry.isDirectory() && recursive) {
        const subFiles = await listFiles(fullPath, recursive);
        files.push(...subFiles);
      }
    }

    return files;
  } catch (error) {
    throw new FileSystemError(
      `Failed to list files in: ${path}`,
      path,
      error as Error
    );
  }
}

/**
 * List subdirectories
 * @param path - Directory path
 */
export async function listDirectories(path: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(path, { withFileTypes: true });
    const dirs: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        dirs.push(join(path, entry.name));
      }
    }

    return dirs;
  } catch (error) {
    throw new FileSystemError(
      `Failed to list directories in: ${path}`,
      path,
      error as Error
    );
  }
}

/**
 * Calculate hash of file content
 * @param path - File path
 * @param algorithm - Hash algorithm (default: 'md5')
 */
export async function getFileHash(
  path: string,
  algorithm: 'md5' | 'sha1' | 'sha256' = 'md5'
): Promise<string> {
  try {
    const { createHash } = await import('node:crypto');
    const content = await readFile(path);
    return createHash(algorithm).update(content).digest('hex');
  } catch (error) {
    throw new FileSystemError(
      `Failed to calculate hash for: ${path}`,
      path,
      error as Error
    );
  }
}

/**
 * Calculate hash of directory contents
 * @param path - Directory path
 * @param algorithm - Hash algorithm (default: 'md5')
 */
export async function getDirectoryHash(
  path: string,
  algorithm: 'md5' | 'sha1' | 'sha256' = 'md5'
): Promise<string> {
  try {
    const { createHash } = await import('node:crypto');
    const files = await listFiles(path, true);

    // Sort files for consistent hash
    files.sort();

    const hash = createHash(algorithm);

    for (const file of files) {
      const content = await readFile(file);
      hash.update(file);
      hash.update(content);
    }

    return hash.digest('hex');
  } catch (error) {
    throw new FileSystemError(
      `Failed to calculate hash for directory: ${path}`,
      path,
      error as Error
    );
  }
}

/**
 * Get file size in bytes
 * @param path - File path
 */
export async function getFileSize(path: string): Promise<number> {
  try {
    const stats = await fs.stat(path);
    return stats.size;
  } catch (error) {
    throw new FileSystemError(
      `Failed to get size for: ${path}`,
      path,
      error as Error
    );
  }
}

/**
 * Get directory size in bytes
 * @param path - Directory path
 */
export async function getDirectorySize(path: string): Promise<number> {
  try {
    const files = await listFiles(path, true);
    let totalSize = 0;

    for (const file of files) {
      totalSize += await getFileSize(file);
    }

    return totalSize;
  } catch (error) {
    throw new FileSystemError(
      `Failed to calculate directory size: ${path}`,
      path,
      error as Error
    );
  }
}
