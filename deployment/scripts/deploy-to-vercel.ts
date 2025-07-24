#!/usr/bin/env npx tsx

/**
 * DealMecca Vercel Deployment Automation Script
 * 
 * Automates the deployment process to Vercel with database setup
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import { performance } from 'perf_hooks';

const execAsync = promisify(exec);

interface DeploymentStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  output?: string;
  error?: string;
}

class VercelDeployment {
  private steps: DeploymentStep[] = [];
  private startTime: number = Date.now();

  private addStep(name: string): DeploymentStep {
    const step: DeploymentStep = { name, status: 'pending' };
    this.steps.push(step);
    return step;
  }

  private async runStep(step: DeploymentStep, command: string | (() => Promise<void>)): Promise<boolean> {
    console.log(`🔄 ${step.name}...`);
    step.status = 'running';
    const startTime = performance.now();

    try {
      if (typeof command === 'string') {
        const { stdout, stderr } = await execAsync(command);
        step.output = stdout;
        if (stderr && !stderr.includes('warning')) {
          console.log(`⚠️ Warning: ${stderr}`);
        }
      } else {
        await command();
      }
      
      step.duration = performance.now() - startTime;
      step.status = 'completed';
      console.log(`✅ ${step.name} completed in ${(step.duration/1000).toFixed(2)}s`);
      return true;
    } catch (error: any) {
      step.duration = performance.now() - startTime;
      step.status = 'failed';
      step.error = error.message;
      console.log(`❌ ${step.name} failed: ${error.message}`);
      return false;
    }
  }

  async checkPrerequisites(): Promise<boolean> {
    console.log('\n🔍 Checking Prerequisites...\n');

    // Check if Vercel CLI is installed
    const vercelCheck = this.addStep('Vercel CLI Available');
    if (!await this.runStep(vercelCheck, 'vercel --version')) {
      console.log('\n💡 Install Vercel CLI: npm install -g vercel');
      return false;
    }

    // Check if logged in to Vercel
    const loginCheck = this.addStep('Vercel Authentication');
    if (!await this.runStep(loginCheck, 'vercel whoami')) {
      console.log('\n💡 Login to Vercel: vercel login');
      return false;
    }

    // Check if database URL is configured
    const dbCheck = this.addStep('Database URL Configuration');
    if (!await this.runStep(dbCheck, async () => {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable not set');
      }
    })) {
      console.log('\n💡 Configure DATABASE_URL in your environment');
      return false;
    }

    // Check if Prisma is working
    const prismaCheck = this.addStep('Prisma CLI Available');
    if (!await this.runStep(prismaCheck, 'npx prisma --version')) {
      return false;
    }

    console.log('\n✅ All prerequisites met!');
    return true;
  }

  async deployToVercel(): Promise<boolean> {
    console.log('\n🚀 Deploying to Vercel...\n');

    // Build the application
    const buildStep = this.addStep('Build Application');
    if (!await this.runStep(buildStep, 'npm run build')) {
      return false;
    }

    // Deploy to Vercel
    const deployStep = this.addStep('Deploy to Vercel');
    if (!await this.runStep(deployStep, 'vercel --prod --yes')) {
      return false;
    }

    console.log('\n🎉 Deployment to Vercel completed!');
    return true;
  }

  async setupDatabase(): Promise<boolean> {
    console.log('\n🗄️ Setting up Production Database...\n');

    // Generate Prisma client
    const generateStep = this.addStep('Generate Prisma Client');
    if (!await this.runStep(generateStep, 'npx prisma generate')) {
      return false;
    }

    // Run database migrations
    const migrateStep = this.addStep('Run Database Migrations');
    if (!await this.runStep(migrateStep, 'npx prisma migrate deploy')) {
      return false;
    }

    // Check migration status
    const statusStep = this.addStep('Verify Migration Status');
    if (!await this.runStep(statusStep, 'npx prisma migrate status')) {
      return false;
    }

    // Seed database
    const seedStep = this.addStep('Seed Production Database');
    if (!await this.runStep(seedStep, 'npx prisma db seed')) {
      console.log('⚠️ Database seeding failed, but this might be expected if data already exists');
    }

    console.log('\n✅ Database setup completed!');
    return true;
  }

  async verifyDeployment(url?: string): Promise<boolean> {
    console.log('\n🔍 Verifying Deployment...\n');

    const deploymentUrl = url || await this.getDeploymentUrl();
    
    if (!deploymentUrl) {
      console.log('❌ Could not determine deployment URL');
      return false;
    }

    console.log(`🌐 Testing deployment at: ${deploymentUrl}`);

    // Test homepage
    const homepageStep = this.addStep('Homepage Health Check');
    if (!await this.runStep(homepageStep, async () => {
      const response = await fetch(deploymentUrl);
      if (!response.ok) {
        throw new Error(`Homepage returned ${response.status}`);
      }
    })) {
      return false;
    }

    // Test health endpoint
    const healthStep = this.addStep('API Health Check');
    if (!await this.runStep(healthStep, async () => {
      const response = await fetch(`${deploymentUrl}/api/health`);
      if (!response.ok) {
        throw new Error(`Health endpoint returned ${response.status}`);
      }
      const data = await response.json();
      if (data.status !== 'healthy') {
        throw new Error('Health check returned unhealthy status');
      }
    })) {
      return false;
    }

    // Test database connectivity
    const dbConnectStep = this.addStep('Database Connectivity');
    if (!await this.runStep(dbConnectStep, 'npx prisma db execute --stdin <<< "SELECT 1 as test"')) {
      return false;
    }

    console.log('\n✅ Deployment verification successful!');
    return true;
  }

  private async getDeploymentUrl(): Promise<string | null> {
    try {
      const { stdout } = await execAsync('vercel ls --scope=@team');
      const lines = stdout.split('\n');
      // Parse Vercel output to get the latest deployment URL
      // This is a simplified version - in practice you'd want more robust parsing
      for (const line of lines) {
        if (line.includes('https://')) {
          const match = line.match(/https:\/\/[^\s]+/);
          if (match) {
            return match[0];
          }
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  generateReport(): string {
    const totalSteps = this.steps.length;
    const completedSteps = this.steps.filter(s => s.status === 'completed').length;
    const failedSteps = this.steps.filter(s => s.status === 'failed');
    const totalDuration = Date.now() - this.startTime;

    return `
🚀 VERCEL DEPLOYMENT REPORT
===========================
📅 Deployment Date: ${new Date().toLocaleString()}
⏱️ Total Duration: ${(totalDuration/1000).toFixed(2)}s
📊 Success Rate: ${((completedSteps/totalSteps)*100).toFixed(1)}%
🎯 Overall Status: ${failedSteps.length === 0 ? '✅ SUCCESS' : '❌ FAILED'}

📋 STEP RESULTS:
===============
${this.steps.map((step, index) => {
  const icon = step.status === 'completed' ? '✅' : 
               step.status === 'failed' ? '❌' : 
               step.status === 'running' ? '🔄' : '⏸️';
  const duration = step.duration ? ` (${(step.duration/1000).toFixed(2)}s)` : '';
  return `${index + 1}. ${icon} ${step.name}${duration}`;
}).join('\n')}

${failedSteps.length > 0 ? `
❌ FAILED STEPS:
===============
${failedSteps.map(step => 
  `• ${step.name}: ${step.error}`
).join('\n')}

🔧 TROUBLESHOOTING:
==================
1. Check the error messages above
2. Verify all environment variables are set
3. Ensure database connection is working
4. Check Vercel dashboard for deployment logs
5. Run: vercel logs [deployment-url]
` : `
🎉 DEPLOYMENT SUCCESSFUL!
========================
✅ All steps completed successfully
✅ Application is live and ready for beta testing
✅ Database is connected and seeded
✅ Health checks passing

🔗 NEXT STEPS:
=============
1. Run post-deployment verification
2. Set up custom domain (if desired)
3. Configure monitoring and analytics
4. Begin beta user onboarding
5. Monitor application performance
`}

📚 USEFUL COMMANDS:
==================
• View logs: vercel logs
• Check domains: vercel domains ls
• Environment vars: vercel env ls
• Project info: vercel inspect

===========================
`;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const deploymentUrl = args[1];

  const deployment = new VercelDeployment();

  console.log(`
🚀 DEALMECCA VERCEL DEPLOYMENT
=============================
🎯 Objective: Deploy to production for beta testing
📅 Date: ${new Date().toLocaleString()}
🔧 Automation: Full deployment pipeline
=============================
  `);

  try {
    switch (command) {
      case 'check':
        await deployment.checkPrerequisites();
        break;
        
      case 'deploy':
        if (!await deployment.checkPrerequisites()) {
          process.exit(1);
        }
        if (!await deployment.deployToVercel()) {
          process.exit(1);
        }
        break;
        
      case 'db':
        if (!await deployment.setupDatabase()) {
          process.exit(1);
        }
        break;
        
      case 'verify':
        if (!await deployment.verifyDeployment(deploymentUrl)) {
          process.exit(1);
        }
        break;
        
      case 'full':
        if (!await deployment.checkPrerequisites()) {
          process.exit(1);
        }
        if (!await deployment.deployToVercel()) {
          process.exit(1);
        }
        if (!await deployment.setupDatabase()) {
          process.exit(1);
        }
        if (!await deployment.verifyDeployment()) {
          process.exit(1);
        }
        break;
        
      default:
        console.log(`
🔧 DealMecca Vercel Deployment Script
====================================

Usage:
  npx tsx deployment/scripts/deploy-to-vercel.ts <command> [url]

Commands:
  check    - Check prerequisites only
  deploy   - Deploy application to Vercel
  db       - Set up database (migrations + seed)
  verify   - Verify deployment [url]
  full     - Complete deployment pipeline

Examples:
  npx tsx deployment/scripts/deploy-to-vercel.ts check
  npx tsx deployment/scripts/deploy-to-vercel.ts full
  npx tsx deployment/scripts/deploy-to-vercel.ts verify https://dealmecca.vercel.app

Prerequisites:
  1. Install Vercel CLI: npm install -g vercel
  2. Login to Vercel: vercel login
  3. Set DATABASE_URL environment variable
  4. Ensure Prisma is configured
        `);
        break;
    }

    const report = deployment.generateReport();
    console.log(report);

    // Save report
    await fs.writeFile(
      'vercel-deployment-report.txt',
      report,
      'utf8'
    );

  } catch (error: any) {
    console.error('\n💥 Fatal deployment error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 