/**
 * Security plugin - npm audit wrapper for vulnerability detection
 *
 * Zero-dependency implementation
 *
 * @packageDocumentation
 */

import { spawn } from 'node:child_process';
import type { AnalyzerPlugin, AnalyzerContext, SecurityAudit, Vulnerability } from '../../types.js';

/**
 * Run npm audit and return JSON results
 * @param cwd - Working directory
 */
async function runNpmAudit(cwd: string): Promise<SecurityAudit> {
  return new Promise((resolve) => {
    const audit = {
      total: 0,
      bySeverity: {
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0
      },
      vulnerabilities: []
    } as SecurityAudit;

    try {
      const npmAudit = spawn('npm', ['audit', '--json'], {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';

      npmAudit.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      npmAudit.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      npmAudit.on('close', (code) => {
        try {
          const result = JSON.parse(stdout);

          // Handle different npm audit output formats
          const vulnerabilities = result.vulnerabilities;
          const metadata = result.metadata;

          if (vulnerabilities && typeof vulnerabilities === 'object') {
            const vulnList: Vulnerability[] = [];

            for (const [pkgName, vulnData] of Object.entries(vulnerabilities)) {
              const data = vulnData as {
                severity?: string;
                title?: string;
                via?: Array<string | { title: string; url: string; path: string }>;
              };

              const severity = (data.severity?.toLowerCase() ?? 'moderate') as Vulnerability['severity'];

              vulnList.push({
                package: pkgName,
                severity,
                title: data.title ?? 'Vulnerability detected',
                range: '*',
                fixedIn: undefined
              });

              // Map npm audit severity to bySeverity keys
              const severityKey = severity === 'critical' ? 'critical' :
                                 severity === 'error' ? 'high' :
                                 severity === 'warning' ? 'moderate' : 'low';
              audit.bySeverity[severityKey]++;
            }

            audit.vulnerabilities = vulnList;
            audit.total = vulnList.length;
          } else if (metadata) {
            // Alternative format with metadata
            audit.bySeverity.critical = metadata.vulnerabilities?.critical ?? 0;
            audit.bySeverity.high = metadata.vulnerabilities?.high ?? 0;
            audit.bySeverity.moderate = metadata.vulnerabilities?.moderate ?? 0;
            audit.bySeverity.low = metadata.vulnerabilities?.low ?? 0;
            audit.total =
              audit.bySeverity.critical +
              audit.bySeverity.high +
              audit.bySeverity.moderate +
              audit.bySeverity.low;
          }

          resolve(audit);
        } catch {
          // Failed to parse, return empty audit
          resolve(audit);
        }
      });

      npmAudit.on('error', () => {
        // npm audit failed, return empty audit
        resolve(audit);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        npmAudit.kill();
        resolve(audit);
      }, 30000);
    } catch {
      resolve(audit);
    }
  });
}

/**
 * Security audit plugin
 */
export const securityPlugin: AnalyzerPlugin<AnalyzerContext> = {
  name: 'security',
  version: '1.0.0',

  install(kernel) {
    kernel.on('analyze', async (context) => {
      kernel.reportProgress('security', 0, 'Running security audit');

      // Run npm audit
      const audit = await runNpmAudit(context.cwd);

      // Store result
      (kernel as any).setResult('security', audit);

      // Report findings
      for (const vuln of audit.vulnerabilities) {
        kernel.reportFinding(
          'security',
          vuln.severity,
          `Vulnerability: ${vuln.package} - ${vuln.title}`,
          vuln.package
        );
      }

      if (audit.total > 0) {
        kernel.reportFinding(
          'security',
          audit.bySeverity.critical > 0 ? 'critical' : audit.bySeverity.high > 0 ? 'error' : 'warning',
          `Found ${audit.total} security vulnerabilities`
        );
      }

      kernel.reportProgress('security', 100, `Found ${audit.total} vulnerabilities`);
    });
  }
};
