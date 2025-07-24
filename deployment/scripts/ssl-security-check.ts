#!/usr/bin/env npx tsx

/**
 * STEP 5: Production Deployment Preparation
 * SSL and Security Configuration Checker
 * 
 * Verifies SSL certificates and security settings for production
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SecurityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

class SSLSecurityChecker {
  private checks: SecurityCheck[] = [];
  private domain = 'your-domain.com'; // Replace with actual domain

  private addCheck(name: string, status: 'pass' | 'fail' | 'warning', message: string, details?: string) {
    this.checks.push({ name, status, message, details });
    const icon = status === 'pass' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${name}: ${message}`);
  }

  async checkEnvironmentVariables(): Promise<void> {
    console.log('\n🔍 Checking Environment Variables...');
    
    const requiredVars = [
      'NEXTAUTH_SECRET',
      'DATABASE_URL',
      'NEXTAUTH_URL',
      'JWT_SECRET'
    ];

    for (const envVar of requiredVars) {
      if (process.env[envVar]) {
        this.addCheck(
          `Environment Variable: ${envVar}`,
          'pass',
          'Present and configured'
        );
      } else {
        this.addCheck(
          `Environment Variable: ${envVar}`,
          'fail',
          'Missing required environment variable'
        );
      }
    }

    // Check sensitive variables are not default values
    if (process.env.NEXTAUTH_SECRET === 'your-secret-here') {
      this.addCheck(
        'NEXTAUTH_SECRET Security',
        'fail',
        'Using default/placeholder secret'
      );
    } else if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length >= 32) {
      this.addCheck(
        'NEXTAUTH_SECRET Security',
        'pass',
        'Strong secret configured'
      );
    } else {
      this.addCheck(
        'NEXTAUTH_SECRET Security',
        'warning',
        'Secret may be too short (recommended: 32+ characters)'
      );
    }
  }

  async checkSSLCertificates(): Promise<void> {
    console.log('\n🔍 Checking SSL Certificates...');
    
    const certPaths = [
      '/etc/ssl/certs/your-domain.crt',
      '/etc/nginx/ssl/live/your-domain.com/fullchain.pem',
      './deployment/ssl/fullchain.pem'
    ];

    let certFound = false;

    for (const certPath of certPaths) {
      if (fs.existsSync(certPath)) {
        certFound = true;
        try {
          const { stdout } = await execAsync(`openssl x509 -in ${certPath} -text -noout`);
          
          if (stdout.includes('Not After')) {
            const expiryMatch = stdout.match(/Not After : (.+)/);
            if (expiryMatch) {
              const expiryDate = new Date(expiryMatch[1]);
              const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              
              if (daysUntilExpiry > 30) {
                this.addCheck(
                  'SSL Certificate Validity',
                  'pass',
                  `Certificate valid for ${daysUntilExpiry} days`,
                  `Expires: ${expiryDate.toDateString()}`
                );
              } else if (daysUntilExpiry > 0) {
                this.addCheck(
                  'SSL Certificate Validity',
                  'warning',
                  `Certificate expires in ${daysUntilExpiry} days`,
                  `Expires: ${expiryDate.toDateString()}`
                );
              } else {
                this.addCheck(
                  'SSL Certificate Validity',
                  'fail',
                  'Certificate has expired',
                  `Expired: ${expiryDate.toDateString()}`
                );
              }
            }
          }

          // Check if certificate includes domain
          if (stdout.includes(this.domain)) {
            this.addCheck(
              'SSL Certificate Domain',
              'pass',
              `Certificate valid for ${this.domain}`
            );
          } else {
            this.addCheck(
              'SSL Certificate Domain',
              'warning',
              `Certificate may not cover ${this.domain}`
            );
          }

        } catch (error) {
          this.addCheck(
            'SSL Certificate Analysis',
            'fail',
            'Unable to analyze certificate',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
        break;
      }
    }

    if (!certFound) {
      this.addCheck(
        'SSL Certificate',
        'fail',
        'No SSL certificate found in expected locations',
        `Checked: ${certPaths.join(', ')}`
      );
    }
  }

  async checkSecurityHeaders(): Promise<void> {
    console.log('\n🔍 Checking Security Headers Configuration...');
    
    const nginxConfigPath = './deployment/nginx/nginx.conf';
    
    if (fs.existsSync(nginxConfigPath)) {
      const nginxConfig = fs.readFileSync(nginxConfigPath, 'utf8');
      
      const securityHeaders = {
        'X-Frame-Options': 'X-Frame-Options',
        'X-Content-Type-Options': 'X-Content-Type-Options',
        'X-XSS-Protection': 'X-XSS-Protection',
        'Strict-Transport-Security': 'Strict-Transport-Security',
        'Content-Security-Policy': 'Content-Security-Policy',
        'Referrer-Policy': 'Referrer-Policy'
      };

      for (const [headerName, configPattern] of Object.entries(securityHeaders)) {
        if (nginxConfig.includes(configPattern)) {
          this.addCheck(
            `Security Header: ${headerName}`,
            'pass',
            'Configured in Nginx'
          );
        } else {
          this.addCheck(
            `Security Header: ${headerName}`,
            'warning',
            'Not found in Nginx configuration'
          );
        }
      }

      // Check for SSL configuration
      if (nginxConfig.includes('ssl_protocols')) {
        this.addCheck(
          'SSL Protocols Configuration',
          'pass',
          'SSL protocols configured'
        );
      } else {
        this.addCheck(
          'SSL Protocols Configuration',
          'fail',
          'SSL protocols not configured'
        );
      }

      // Check for rate limiting
      if (nginxConfig.includes('limit_req_zone')) {
        this.addCheck(
          'Rate Limiting',
          'pass',
          'Rate limiting configured'
        );
      } else {
        this.addCheck(
          'Rate Limiting',
          'warning',
          'Rate limiting not configured'
        );
      }

    } else {
      this.addCheck(
        'Nginx Configuration',
        'fail',
        'Nginx configuration file not found'
      );
    }
  }

  async checkDockerSecurity(): Promise<void> {
    console.log('\n🔍 Checking Docker Security Configuration...');
    
    const dockerComposePath = './deployment/docker-compose.production.yml';
    
    if (fs.existsSync(dockerComposePath)) {
      const dockerConfig = fs.readFileSync(dockerComposePath, 'utf8');
      
      // Check for resource limits
      if (dockerConfig.includes('resources:') && dockerConfig.includes('limits:')) {
        this.addCheck(
          'Docker Resource Limits',
          'pass',
          'Resource limits configured'
        );
      } else {
        this.addCheck(
          'Docker Resource Limits',
          'warning',
          'Resource limits not configured'
        );
      }

      // Check for health checks
      if (dockerConfig.includes('healthcheck:')) {
        this.addCheck(
          'Docker Health Checks',
          'pass',
          'Health checks configured'
        );
      } else {
        this.addCheck(
          'Docker Health Checks',
          'warning',
          'Health checks not configured'
        );
      }

      // Check for restart policies
      if (dockerConfig.includes('restart: unless-stopped')) {
        this.addCheck(
          'Docker Restart Policy',
          'pass',
          'Restart policy configured'
        );
      } else {
        this.addCheck(
          'Docker Restart Policy',
          'warning',
          'Restart policy not configured'
        );
      }

      // Check for secrets handling
      if (dockerConfig.includes('env_file:')) {
        this.addCheck(
          'Docker Secrets Management',
          'pass',
          'Environment file configured'
        );
      } else {
        this.addCheck(
          'Docker Secrets Management',
          'warning',
          'Environment file not configured'
        );
      }

    } else {
      this.addCheck(
        'Docker Compose Configuration',
        'fail',
        'Docker Compose file not found'
      );
    }
  }

  async checkDatabaseSecurity(): Promise<void> {
    console.log('\n🔍 Checking Database Security...');
    
    const databaseUrl = process.env.DATABASE_URL;
    
    if (databaseUrl) {
      // Check for SSL mode
      if (databaseUrl.includes('sslmode=require')) {
        this.addCheck(
          'Database SSL Mode',
          'pass',
          'SSL required for database connections'
        );
      } else if (databaseUrl.includes('sslmode=')) {
        this.addCheck(
          'Database SSL Mode',
          'warning',
          'SSL configured but not required'
        );
      } else {
        this.addCheck(
          'Database SSL Mode',
          'fail',
          'SSL not configured for database'
        );
      }

      // Check for credentials in URL (should be in environment)
      if (databaseUrl.includes('://') && databaseUrl.includes('@')) {
        this.addCheck(
          'Database Credentials',
          'warning',
          'Credentials visible in DATABASE_URL'
        );
      } else {
        this.addCheck(
          'Database Credentials',
          'pass',
          'Credentials properly configured'
        );
      }

    } else {
      this.addCheck(
        'Database Configuration',
        'fail',
        'DATABASE_URL not configured'
      );
    }
  }

  async checkFirewallAndNetwork(): Promise<void> {
    console.log('\n🔍 Checking Network Security...');
    
    try {
      // Check if common security tools are available
      await execAsync('which ufw');
      this.addCheck(
        'UFW Firewall',
        'pass',
        'UFW firewall available'
      );
    } catch {
      this.addCheck(
        'UFW Firewall',
        'warning',
        'UFW firewall not available'
      );
    }

    try {
      // Check for fail2ban
      await execAsync('which fail2ban-client');
      this.addCheck(
        'Fail2Ban',
        'pass',
        'Fail2Ban available for intrusion prevention'
      );
    } catch {
      this.addCheck(
        'Fail2Ban',
        'warning',
        'Fail2Ban not available'
      );
    }
  }

  generateReport(): string {
    const totalChecks = this.checks.length;
    const passedChecks = this.checks.filter(c => c.status === 'pass').length;
    const warningChecks = this.checks.filter(c => c.status === 'warning').length;
    const failedChecks = this.checks.filter(c => c.status === 'fail').length;
    
    const securityScore = Math.round((passedChecks / totalChecks) * 100);
    const overallStatus = securityScore >= 90 ? '🟢 EXCELLENT' : 
                         securityScore >= 75 ? '🟡 GOOD' : 
                         securityScore >= 60 ? '🟠 NEEDS IMPROVEMENT' : 
                         '🔴 CRITICAL ISSUES';

    return `
🔒 SSL & SECURITY CONFIGURATION REPORT
======================================
📅 Test Date: ${new Date().toLocaleString()}
🎯 Domain: ${this.domain}
🔒 Security Score: ${securityScore}%
🎯 Overall Status: ${overallStatus}

📊 SECURITY METRICS:
===================
✅ Passed Checks: ${passedChecks}/${totalChecks}
⚠️ Warning Checks: ${warningChecks}
❌ Failed Checks: ${failedChecks}

📋 DETAILED RESULTS:
===================
${this.checks.map((check, index) => {
  const icon = check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
  return `${index + 1}. ${icon} ${check.name}: ${check.message}${check.details ? `\n   Details: ${check.details}` : ''}`;
}).join('\n')}

${failedChecks > 0 ? `
🚨 CRITICAL SECURITY ISSUES:
===========================
${this.checks
  .filter(c => c.status === 'fail')
  .map(c => `• ${c.name}: ${c.message}`)
  .join('\n')}
` : ''}

${warningChecks > 0 ? `
⚠️ SECURITY WARNINGS:
====================
${this.checks
  .filter(c => c.status === 'warning')
  .map(c => `• ${c.name}: ${c.message}`)
  .join('\n')}
` : ''}

🔒 PRODUCTION READINESS:
=======================
SSL Configuration: ${this.checks.find(c => c.name.includes('SSL Certificate'))?.status === 'pass' ? '✅ READY' : '❌ NOT READY'}
Security Headers: ${this.checks.filter(c => c.name.includes('Security Header')).every(c => c.status === 'pass') ? '✅ CONFIGURED' : '⚠️ INCOMPLETE'}
Environment Security: ${this.checks.filter(c => c.name.includes('Environment')).every(c => c.status === 'pass') ? '✅ SECURE' : '❌ NEEDS ATTENTION'}
Database Security: ${this.checks.find(c => c.name.includes('Database'))?.status === 'pass' ? '✅ SECURE' : '⚠️ NEEDS REVIEW'}

💡 RECOMMENDATIONS:
==================
${securityScore < 100 ? '• Address failed security checks before production deployment' : ''}
${warningChecks > 0 ? '• Review and resolve security warnings' : ''}
• Implement regular security audits
• Monitor SSL certificate expiration
• Keep security headers updated
• Regular security scanning and penetration testing
• Implement Web Application Firewall (WAF)
• Set up security monitoring and alerting

🎯 NEXT STEPS:
=============
${securityScore >= 90 ? 
`🎉 Security configuration is production-ready!
✅ Deploy with confidence
✅ Monitor security metrics
✅ Schedule regular security reviews` :
`🚨 Address security issues before production
🔧 Fix critical security problems
📝 Review and update security configurations
🔄 Re-run security checks after fixes`}

======================================
`;
  }

  async runAllChecks(): Promise<void> {
    console.log('\n🔒 SSL & SECURITY CONFIGURATION CHECK');
    console.log('====================================');
    console.log('📅 Check Date:', new Date().toLocaleString());
    console.log('🎯 Objective: Verify production security readiness\n');

    await this.checkEnvironmentVariables();
    await this.checkSSLCertificates();
    await this.checkSecurityHeaders();
    await this.checkDockerSecurity();
    await this.checkDatabaseSecurity();
    await this.checkFirewallAndNetwork();
  }
}

async function main() {
  const checker = new SSLSecurityChecker();
  
  try {
    await checker.runAllChecks();
    const report = checker.generateReport();
    
    console.log(report);
    
    // Save report to file
    const fs = await import('fs/promises');
    await fs.writeFile(
      'ssl-security-check-report.txt', 
      report, 
      'utf8'
    );
    
    console.log('\n📄 Report saved to: ssl-security-check-report.txt');
    
    // Determine exit code based on critical issues
    const criticalIssues = checker['checks'].filter(c => c.status === 'fail').length;
    process.exit(criticalIssues === 0 ? 0 : 1);
    
  } catch (error: any) {
    console.error('\n💥 Fatal error during security check:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 