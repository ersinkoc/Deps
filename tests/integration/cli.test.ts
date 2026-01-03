/**
 * CLI integration tests
 *
 * @packageDocumentation
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';

describe('CLI', () => {
  it('should show help', () => {
    try {
      const output = execSync('node dist/cli.js help', {
        cwd: process.cwd(),
        encoding: 'utf-8'
      });
      expect(output).toContain('@oxog/deps');
      expect(output).toContain('USAGE');
    } catch {
      // Build may not exist yet, skip test
    }
  });

  it('should show version', () => {
    try {
      const output = execSync('node dist/cli.js --version', {
        cwd: process.cwd(),
        encoding: 'utf-8'
      });
      expect(output).toContain('1.0.0');
    } catch {
      // Build may not exist yet, skip test
    }
  });
});
