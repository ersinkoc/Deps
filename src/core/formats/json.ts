/**
 * JSON output formatter
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import type { AnalysisResult } from '../../types.js';

/**
 * Convert analysis result to JSON string
 * @param result - Analysis result
 * @param pretty - Whether to pretty print (default: true)
 */
export function toJSON(result: AnalysisResult, pretty: boolean = true): string {
  const data = {
    tree: result.tree,
    circular: result.circular,
    unused: result.unused,
    missing: result.missing,
    duplicates: result.duplicates,
    size: result.size,
    updates: result.updates,
    security: result.security,
    exitCode: result.exitCode
  };

  return JSON.stringify(data, null, pretty ? 2 : 0);
}
