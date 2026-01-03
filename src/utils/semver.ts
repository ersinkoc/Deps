/**
 * Semver utilities
 *
 * Zero-dependency semantic version parsing and comparison
 *
 * @packageDocumentation
 */

/**
 * Parsed semantic version
 */
export interface Semver {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string[];
  build?: string[];
  original: string;
}

/**
 * Parse semver string
 * @param version - Version string (e.g., '1.2.3', '2.0.0-alpha.1')
 */
export function parseSemver(version: string): Semver {
  // Clean version string
  const cleaned = version.trim().replace(/^v/i, '');

  // Match semver pattern
  const match = cleaned.match(
    /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-\.]+))?(?:\+([0-9A-Za-z-\.]+))?$/
  );

  if (!match) {
    throw new Error(`Invalid semver: ${version}`);
  }

  const semver: Semver = {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    original: version
  };

  if (match[4]) {
    semver.prerelease = match[4].split('.');
  }

  if (match[5]) {
    semver.build = match[5].split('.');
  }

  return semver;
}

/**
 * Compare two semver versions
 * @param v1 - First version
 * @param v2 - Second version
 * @returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareSemver(v1: string, v2: string): number {
  const s1 = parseSemver(v1);
  const s2 = parseSemver(v2);

  // Compare major
  if (s1.major !== s2.major) {
    return s1.major > s2.major ? 1 : -1;
  }

  // Compare minor
  if (s1.minor !== s2.minor) {
    return s1.minor > s2.minor ? 1 : -1;
  }

  // Compare patch
  if (s1.patch !== s2.patch) {
    return s1.patch > s2.patch ? 1 : -1;
  }

  // Compare prerelease
  const p1 = s1.prerelease ?? [];
  const p2 = s2.prerelease ?? [];

  // Versions with prerelease are less than without
  if (p1.length === 0 && p2.length > 0) return 1;
  if (p1.length > 0 && p2.length === 0) return -1;

  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const part1 = p1[i];
    const part2 = p2[i];

    // Missing parts are considered less
    if (part1 === undefined && part2 === undefined) return 0;
    if (part1 === undefined) return -1;
    if (part2 === undefined) return 1;

    // Try numeric comparison
    const num1 = parseInt(part1, 10);
    const num2 = parseInt(part2, 10);

    if (!isNaN(num1) && !isNaN(num2)) {
      if (num1 !== num2) {
        return num1 > num2 ? 1 : -1;
      }
    } else {
      // String comparison
      const cmp = part1.localeCompare(part2);
      if (cmp !== 0) return cmp;
    }
  }

  return 0;
}

/**
 * Check if a version satisfies a range
 * @param version - Version to check
 * @param range - Version range (e.g., '^1.2.3', '~2.0.0', '*', '>=1.0.0')
 */
export function satisfies(version: string, range: string): boolean {
  const cleanedRange = range.trim();

  // Wildcard - any version
  if (cleanedRange === '' || cleanedRange === '*' || cleanedRange === 'x') {
    return true;
  }

  // Exact version
  if (/^\d+\.\d+\.\d+/.test(cleanedRange)) {
    return compareSemver(version, cleanedRange) === 0;
  }

  // Caret range (^1.2.3) - >=1.2.3 <2.0.0
  if (cleanedRange.startsWith('^')) {
    const baseVersion = cleanedRange.slice(1);
    const parsed = parseSemver(baseVersion);

    if (parsed.major === 0) {
      // For 0.x.y, be more conservative
      if (parsed.minor === 0) {
        // 0.0.x - only patch updates
        return (
          compareSemver(version, baseVersion) >= 0 &&
          compareSemver(version, `0.0.${parsed.patch + 1}`) < 0
        );
      }
      // 0.x.y - minor and patch updates
      return (
        compareSemver(version, baseVersion) >= 0 &&
        compareSemver(version, `0.${parsed.minor + 1}.0`) < 0
      );
    }

    return (
      compareSemver(version, baseVersion) >= 0 &&
      compareSemver(version, `${parsed.major + 1}.0.0`) < 0
    );
  }

  // Tilde range (~1.2.3) - >=1.2.3 <1.3.0
  if (cleanedRange.startsWith('~')) {
    const baseVersion = cleanedRange.slice(1);
    const parsed = parseSemver(baseVersion);

    return (
      compareSemver(version, baseVersion) >= 0 &&
      compareSemver(version, `${parsed.major}.${parsed.minor + 1}.0`) < 0
    );
  }

  // Greater than or equal (>=1.2.3)
  if (cleanedRange.startsWith('>=')) {
    return compareSemver(version, cleanedRange.slice(2)) >= 0;
  }

  // Greater than (>1.2.3)
  if (cleanedRange.startsWith('>')) {
    return compareSemver(version, cleanedRange.slice(1)) > 0;
  }

  // Less than or equal (<=1.2.3)
  if (cleanedRange.startsWith('<=')) {
    return compareSemver(version, cleanedRange.slice(2)) <= 0;
  }

  // Less than (<1.2.3)
  if (cleanedRange.startsWith('<')) {
    return compareSemver(version, cleanedRange.slice(1)) < 0;
  }

  // Hyphen range (1.2.3 - 2.0.0)
  const hyphenMatch = cleanedRange.match(
    /^(\d+\.\d+\.\d+)\s*-\s*(\d+\.\d+\.\d+)$/
  );
  if (hyphenMatch) {
    return (
      compareSemver(version, hyphenMatch[1]) >= 0 &&
      compareSemver(version, hyphenMatch[2]) <= 0
    );
  }

  // X range (1.x.x, 1.2.x)
  const xMatch = cleanedRange.match(/^(\d+)\.x\.x$|^(\d+)\.(\d+)\.x$/);
  if (xMatch) {
    const major = xMatch[1] || xMatch[2];
    const minor = xMatch[3];

    if (minor) {
      // 1.2.x - any patch
      return (
        version.startsWith(`${major}.${minor}.`) &&
        compareSemver(version, `${major}.${minor}.0`) >= 0
      );
    }
    // 1.x.x - any minor/patch
    return version.startsWith(`${major}.`);
  }

  throw new Error(`Unsupported range: ${range}`);
}

/**
 * Get the type of update between two versions
 * @param current - Current version
 * @param latest - Latest version
 */
export function getUpdateType(
  current: string,
  latest: string
): 'major' | 'minor' | 'patch' | 'none' {
  const cmp = compareSemver(current, latest);

  if (cmp >= 0) return 'none';

  const c = parseSemver(current);
  const l = parseSemver(latest);

  if (l.major > c.major) return 'major';
  if (l.minor > c.minor) return 'minor';
  return 'patch';
}

/**
 * Find maximum version that satisfies range
 * @param versions - Array of version strings
 * @param range - Version range
 */
export function maxSatisfying(versions: string[], range: string): string | null {
  let max: string | null = null;

  for (const version of versions) {
    if (satisfies(version, range)) {
      if (!max || compareSemver(version, max) > 0) {
        max = version;
      }
    }
  }

  return max;
}

/**
 * Validate semver string
 * @param version - Version string to validate
 */
export function isValidSemver(version: string): boolean {
  try {
    parseSemver(version);
    return true;
  } catch {
    return false;
  }
}

/**
 * Increment version by release type
 * @param version - Version string
 * @param release - Release type ('major', 'minor', 'patch')
 */
export function incrementVersion(
  version: string,
  release: 'major' | 'minor' | 'patch'
): string {
  const parsed = parseSemver(version);

  switch (release) {
    case 'major':
      return `${parsed.major + 1}.0.0`;
    case 'minor':
      return `${parsed.major}.${parsed.minor + 1}.0`;
    case 'patch':
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
  }
}
