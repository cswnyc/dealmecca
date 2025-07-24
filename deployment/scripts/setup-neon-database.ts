#!/usr/bin/env npx tsx

/**
 * Neon Database Setup Helper Script
 * 
 * Assists with setting up and configuring Neon PostgreSQL for DealMecca
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import { performance } from 'perf_hooks';

const execAsync = promisify(exec);

interface DatabaseCheck {
  name: string;
  success: boolean;
  message: string;
  details?: string;
}

class NeonDatabaseSetup {
  private checks: DatabaseCheck[] = [];
  private databaseUrl: string;

  constructor(databaseUrl?: string) {
    this.databaseUrl = databaseUrl || process.env.DATABASE_URL || '';
  }

  private addCheck(name: string, success: boolean, message: string, details?: string) {
    this.checks.push({ name, success, message, details });
    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${name}: ${message}`);
    if (details) {
      console.log(`   ${details}`);
    }
  }

  async validateDatabaseUrl(): Promise<boolean> {
    console.log('\n🔍 Validating Database Configuration...\n');

    if (!this.databaseUrl) {
      this.addCheck(
        'Database URL', 
        false, 
        'DATABASE_URL not provided',
        'Set DATABASE_URL environment variable or pass as argument'
      );
      return false;
    }

    // Check URL format
    const urlPattern = /^postgresql:\/\/[^:]+:[^@]+@[^\/]+\/[^?]+(\?.*)?$/;
    if (!urlPattern.test(this.databaseUrl)) {
      this.addCheck(
        'Database URL Format',
        false,
        'Invalid PostgreSQL URL format',
        'Expected: postgresql://username:password@host/database?sslmode=require'
      );
      return false;
    }

    this.addCheck('Database URL Format', true, 'Valid PostgreSQL URL format');

    // Check if it's a Neon URL
    const isNeon = this.databaseUrl.includes('.neon.tech');
    this.addCheck(
      'Neon Database',
      isNeon,
      isNeon ? 'Neon PostgreSQL detected' : 'Not a Neon database URL',
      isNeon ? 'Neon provides excellent Vercel integration' : 'Consider using Neon for better Vercel integration'
    );

    // Check SSL mode
    const hasSSL = this.databaseUrl.includes('sslmode=require');
    this.addCheck(
      'SSL Mode',
      hasSSL,
      hasSSL ? 'SSL mode configured' : 'SSL mode not configured',
      hasSSL ? 'SSL required for security' : 'Add ?sslmode=require to URL for production security'
    );

    return true;
  }

  async testConnection(): Promise<boolean> {
    console.log('\n🔗 Testing Database Connection...\n');

    try {
      // Test basic connection
      const { stdout, stderr } = await execAsync(
        `psql "${this.databaseUrl}" -c "SELECT version();" -t`,
        { timeout: 10000 }
      );

      if (stderr && stderr.toLowerCase().includes('error')) {
        this.addCheck(
          'Database Connection',
          false,
          'Connection failed',
          stderr.trim()
        );
        return false;
      }

      this.addCheck(
        'Database Connection',
        true,
        'Successfully connected to database',
        stdout.trim().substring(0, 100) + '...'
      );

      // Test database permissions
      await this.testPermissions();
      
      return true;
    } catch (error: any) {
      this.addCheck(
        'Database Connection',
        false,
        'Connection failed',
        error.message
      );
      return false;
    }
  }

  private async testPermissions(): Promise<void> {
    try {
      // Test CREATE TABLE permission
      await execAsync(
        `psql "${this.databaseUrl}" -c "CREATE TABLE IF NOT EXISTS test_permissions (id SERIAL PRIMARY KEY, test_column TEXT);" -t`,
        { timeout: 5000 }
      );

      // Test INSERT permission
      await execAsync(
        `psql "${this.databaseUrl}" -c "INSERT INTO test_permissions (test_column) VALUES ('test');" -t`,
        { timeout: 5000 }
      );

      // Test SELECT permission
      await execAsync(
        `psql "${this.databaseUrl}" -c "SELECT COUNT(*) FROM test_permissions;" -t`,
        { timeout: 5000 }
      );

      // Clean up
      await execAsync(
        `psql "${this.databaseUrl}" -c "DROP TABLE test_permissions;" -t`,
        { timeout: 5000 }
      );

      this.addCheck(
        'Database Permissions',
        true,
        'Full database permissions confirmed',
        'CREATE, INSERT, SELECT, DROP operations successful'
      );
    } catch (error: any) {
      this.addCheck(
        'Database Permissions',
        false,
        'Insufficient database permissions',
        error.message
      );
    }
  }

  async checkPrismaCompatibility(): Promise<boolean> {
    console.log('\n🔧 Checking Prisma Compatibility...\n');

    try {
      // Test Prisma connection
      const { stdout, stderr } = await execAsync(
        `DATABASE_URL="${this.databaseUrl}" npx prisma db execute --stdin <<< "SELECT 1 as test;"`,
        { timeout: 10000 }
      );

      this.addCheck(
        'Prisma Connection',
        true,
        'Prisma can connect to database',
        'Prisma CLI successfully executed query'
      );

      // Check migration status
      try {
        const migrationResult = await execAsync(
          `DATABASE_URL="${this.databaseUrl}" npx prisma migrate status`,
          { timeout: 10000 }
        );

        this.addCheck(
          'Migration Status',
          true,
          'Migration status retrieved',
          'Database is ready for migrations'
        );
      } catch (migrationError: any) {
        if (migrationError.message.includes('not been initialized')) {
          this.addCheck(
            'Migration Status',
            true,
            'Database not initialized (expected for new database)',
            'Ready for initial migration deployment'
          );
        } else {
          this.addCheck(
            'Migration Status',
            false,
            'Migration check failed',
            migrationError.message
          );
        }
      }

      return true;
    } catch (error: any) {
      this.addCheck(
        'Prisma Connection',
        false,
        'Prisma cannot connect to database',
        error.message
      );
      return false;
    }
  }

  async generateEnvFile(): Promise<void> {
    console.log('\n📝 Generating Environment Configuration...\n');

    const envContent = `# Database Configuration (Generated)
DATABASE_URL="${this.databaseUrl}"
DIRECT_URL="${this.databaseUrl}"

# Copy these to your .env.production file and add other required variables:
# NEXTAUTH_SECRET=your-secure-secret-32-chars-minimum
# NEXTAUTH_URL=https://your-app.vercel.app
# STRIPE_PUBLISHABLE_KEY=pk_test_your_key
# STRIPE_SECRET_KEY=sk_test_your_key
# ... (see deployment/production.env.example for complete list)
`;

    try {
      await fs.writeFile('database.env', envContent);
      this.addCheck(
        'Environment File',
        true,
        'Database environment configuration generated',
        'File saved as: database.env'
      );
    } catch (error: any) {
      this.addCheck(
        'Environment File',
        false,
        'Failed to generate environment file',
        error.message
      );
    }
  }

  generateSetupReport(): string {
    const totalChecks = this.checks.length;
    const passedChecks = this.checks.filter(c => c.success).length;
    const failedChecks = this.checks.filter(c => !c.success);
    const successRate = Math.round((passedChecks / totalChecks) * 100);

    return `
🗄️ NEON DATABASE SETUP REPORT
=============================
📅 Check Date: ${new Date().toLocaleString()}
🎯 Database URL: ${this.databaseUrl ? this.databaseUrl.replace(/:[^@]*@/, ':****@') : 'Not provided'}
📊 Success Rate: ${successRate}%
🎯 Overall Status: ${successRate >= 80 ? '✅ READY' : '❌ NEEDS ATTENTION'}

📋 CHECK RESULTS:
================
${this.checks.map((check, index) => {
  const icon = check.success ? '✅' : '❌';
  return `${index + 1}. ${icon} ${check.name}: ${check.message}${check.details ? '\n   ' + check.details : ''}`;
}).join('\n')}

${failedChecks.length > 0 ? `
❌ ISSUES TO RESOLVE:
====================
${failedChecks.map(check => 
  `• ${check.name}: ${check.message}${check.details ? '\n  Solution: ' + check.details : ''}`
).join('\n')}
` : ''}

🚀 NEXT STEPS:
=============
${successRate >= 80 ? 
`✅ Database setup looks good! You can proceed with:
1. Copy DATABASE_URL to your .env.production file
2. Add other required environment variables (see production.env.example)
3. Deploy to Vercel: npx tsx deployment/scripts/deploy-to-vercel.ts full
4. Run database migrations in production
` :
`❌ Please resolve the issues above before proceeding:
1. Ensure DATABASE_URL is correctly formatted
2. Verify database connection and permissions
3. Check Prisma configuration
4. Re-run this setup script after fixes
`}

💡 HELPFUL COMMANDS:
===================
• Test connection: psql "${this.databaseUrl.replace(/:[^@]*@/, ':****@')}" -c "SELECT version();"
• Prisma introspect: DATABASE_URL="your-url" npx prisma db pull
• Run migrations: DATABASE_URL="your-url" npx prisma migrate deploy
• Open Prisma Studio: DATABASE_URL="your-url" npx prisma studio

📚 RESOURCES:
============
• Neon Console: https://console.neon.tech
• Neon Docs: https://neon.tech/docs
• Vercel Integration: https://vercel.com/integrations/neon
• Prisma with Neon: https://neon.tech/docs/guides/prisma

=============================
`;
  }

  async runFullSetup(): Promise<boolean> {
    console.log(`
🗄️ NEON DATABASE SETUP FOR DEALMECCA
====================================
🎯 Objective: Validate database configuration for Vercel deployment
📅 Date: ${new Date().toLocaleString()}
====================================
    `);

    const urlValid = await this.validateDatabaseUrl();
    if (!urlValid) return false;

    const connectionSuccessful = await this.testConnection();
    const prismaCompatible = await this.checkPrismaCompatibility();

    await this.generateEnvFile();

    const report = this.generateSetupReport();
    console.log(report);

    // Save report
    try {
      await fs.writeFile('neon-setup-report.txt', report);
      console.log('\n📄 Report saved as: neon-setup-report.txt');
    } catch (error) {
      console.log('\n⚠️ Could not save report file');
    }

    return connectionSuccessful && prismaCompatible;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const databaseUrl = args[1];

  switch (command) {
    case 'check':
      const setup = new NeonDatabaseSetup(databaseUrl);
      const success = await setup.runFullSetup();
      process.exit(success ? 0 : 1);
      break;

    case 'connect':
      if (!databaseUrl) {
        console.log('❌ Please provide DATABASE_URL as second argument');
        process.exit(1);
      }
      try {
        await execAsync(`psql "${databaseUrl}" -c "SELECT 'Connection successful!' as status;"`);
        console.log('✅ Connection test successful!');
      } catch (error: any) {
        console.log(`❌ Connection failed: ${error.message}`);
        process.exit(1);
      }
      break;

    default:
      console.log(`
🗄️ Neon Database Setup Helper
=============================

Usage:
  npx tsx deployment/scripts/setup-neon-database.ts <command> [database-url]

Commands:
  check [url]    - Run full database setup validation
  connect <url>  - Test connection to database

Examples:
  npx tsx deployment/scripts/setup-neon-database.ts check
  npx tsx deployment/scripts/setup-neon-database.ts check "postgresql://user:pass@host.neon.tech/db"
  npx tsx deployment/scripts/setup-neon-database.ts connect "postgresql://user:pass@host.neon.tech/db"

Environment:
  Set DATABASE_URL environment variable or pass as argument

Setup Steps:
  1. Create Neon account at https://neon.tech
  2. Create new project: dealmecca-production
  3. Copy PostgreSQL connection string
  4. Run: npx tsx deployment/scripts/setup-neon-database.ts check "your-database-url"
      `);
      break;
  }
}

if (require.main === module) {
  main();
} 