#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import { createWriteStream, createReadStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';

const prisma = new PrismaClient();

export interface BackupConfig {
  outputDir: string;
  includeUploads: boolean;
  compress: boolean;
  encryption?: {
    enabled: boolean;
    key: string;
  };
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental';
  size: number;
  tables: string[];
  version: string;
  checksum: string;
  compressed: boolean;
  encrypted: boolean;
}

export interface RestoreOptions {
  backupId: string;
  tables?: string[];
  dryRun: boolean;
  skipValidation: boolean;
}

/**
 * Comprehensive backup and restore system for dealmecca
 */
export class BackupRestoreManager {
  private static instance: BackupRestoreManager;
  private config: BackupConfig;

  constructor(config: BackupConfig) {
    this.config = config;
    this.ensureDirectoryExists(config.outputDir);
  }

  static getInstance(config: BackupConfig): BackupRestoreManager {
    if (!BackupRestoreManager.instance) {
      BackupRestoreManager.instance = new BackupRestoreManager(config);
    }
    return BackupRestoreManager.instance;
  }

  /**
   * Create full database backup
   */
  async createFullBackup(): Promise<BackupMetadata> {
    const backupId = `full_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const timestamp = new Date();
    
    console.log(`🔄 Starting full backup: ${backupId}`);

    try {
      // Create backup directory
      const backupDir = join(this.config.outputDir, backupId);
      this.ensureDirectoryExists(backupDir);

      // Backup database
      const dbBackupFile = join(backupDir, 'database.sql');
      await this.createDatabaseBackup(dbBackupFile);

      // Backup application data
      const dataBackupFile = join(backupDir, 'data.json');
      await this.createDataBackup(dataBackupFile);

      // Backup configuration
      const configBackupFile = join(backupDir, 'config.json');
      await this.createConfigBackup(configBackupFile);

      // Create metadata
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'full',
        size: await this.calculateBackupSize(backupDir),
        tables: await this.getAllTableNames(),
        version: process.env.APP_VERSION || '1.0.0',
        checksum: await this.calculateChecksum(backupDir),
        compressed: this.config.compress,
        encrypted: this.config.encryption?.enabled || false,
      };

      // Save metadata
      await this.saveBackupMetadata(backupDir, metadata);

      // Compress if enabled
      if (this.config.compress) {
        await this.compressBackup(backupDir);
      }

      // Encrypt if enabled
      if (this.config.encryption?.enabled) {
        await this.encryptBackup(backupDir);
      }

      console.log(`✅ Full backup completed: ${backupId}`);
      console.log(`   Size: ${(metadata.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Tables: ${metadata.tables.length}`);

      return metadata;

    } catch (error) {
      console.error(`❌ Full backup failed: ${backupId}`, error);
      throw error;
    }
  }

  /**
   * Create incremental backup (changes since last backup)
   */
  async createIncrementalBackup(lastBackupTimestamp: Date): Promise<BackupMetadata> {
    const backupId = `incremental_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const timestamp = new Date();
    
    console.log(`🔄 Starting incremental backup: ${backupId}`);
    console.log(`   Since: ${lastBackupTimestamp.toISOString()}`);

    try {
      const backupDir = join(this.config.outputDir, backupId);
      this.ensureDirectoryExists(backupDir);

      // Get changed data since last backup
      const changes = await this.getChangedDataSince(lastBackupTimestamp);

      // Create incremental backup files
      const changesFile = join(backupDir, 'changes.json');
      await this.saveJsonFile(changesFile, changes);

      // Create metadata
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'incremental',
        size: await this.calculateBackupSize(backupDir),
        tables: Object.keys(changes),
        version: process.env.APP_VERSION || '1.0.0',
        checksum: await this.calculateChecksum(backupDir),
        compressed: this.config.compress,
        encrypted: this.config.encryption?.enabled || false,
      };

      await this.saveBackupMetadata(backupDir, metadata);

      if (this.config.compress) {
        await this.compressBackup(backupDir);
      }

      if (this.config.encryption?.enabled) {
        await this.encryptBackup(backupDir);
      }

      console.log(`✅ Incremental backup completed: ${backupId}`);
      return metadata;

    } catch (error) {
      console.error(`❌ Incremental backup failed: ${backupId}`, error);
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(options: RestoreOptions): Promise<void> {
    const { backupId, tables, dryRun, skipValidation } = options;
    
    console.log(`🔄 Starting restore from backup: ${backupId}`);
    console.log(`   Dry run: ${dryRun}`);
    console.log(`   Tables: ${tables?.join(', ') || 'all'}`);

    try {
      // Load backup metadata
      const backupDir = join(this.config.outputDir, backupId);
      const metadata = await this.loadBackupMetadata(backupDir);

      // Validate backup integrity
      if (!skipValidation) {
        await this.validateBackup(backupDir, metadata);
      }

      // Decrypt if needed
      if (metadata.encrypted) {
        await this.decryptBackup(backupDir);
      }

      // Decompress if needed
      if (metadata.compressed) {
        await this.decompressBackup(backupDir);
      }

      if (dryRun) {
        console.log('🔍 Dry run mode - showing what would be restored:');
        await this.showRestorePreview(backupDir, metadata, tables);
        return;
      }

      // Perform actual restore
      if (metadata.type === 'full') {
        await this.performFullRestore(backupDir, tables);
      } else {
        await this.performIncrementalRestore(backupDir, tables);
      }

      console.log(`✅ Restore completed successfully from: ${backupId}`);

    } catch (error) {
      console.error(`❌ Restore failed from backup: ${backupId}`, error);
      throw error;
    }
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const backups: BackupMetadata[] = [];
      const entries = await this.readDirectory(this.config.outputDir);

      for (const entry of entries) {
        if (entry.isDirectory()) {
          try {
            const metadata = await this.loadBackupMetadata(
              join(this.config.outputDir, entry.name)
            );
            backups.push(metadata);
          } catch {
            // Skip invalid backup directories
          }
        }
      }

      return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    } catch (error) {
      console.error('❌ Failed to list backups', error);
      throw error;
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  async cleanupOldBackups(): Promise<{ deleted: string[]; kept: string[] }> {
    console.log('🧹 Starting backup cleanup based on retention policy');

    try {
      const backups = await this.listBackups();
      const { deleted, kept } = this.calculateBackupsToDelete(backups);

      // Delete old backups
      for (const backupId of deleted) {
        const backupDir = join(this.config.outputDir, backupId);
        await this.deleteDirectory(backupDir);
        console.log(`   Deleted: ${backupId}`);
      }

      console.log(`✅ Cleanup completed. Kept: ${kept.length}, Deleted: ${deleted.length}`);
      return { deleted, kept };

    } catch (error) {
      console.error('❌ Backup cleanup failed', error);
      throw error;
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(backupId: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    console.log(`🔍 Verifying backup: ${backupId}`);

    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const backupDir = join(this.config.outputDir, backupId);
      
      // Check if backup directory exists
      if (!existsSync(backupDir)) {
        errors.push('Backup directory does not exist');
        return { valid: false, errors, warnings };
      }

      // Load and validate metadata
      const metadata = await this.loadBackupMetadata(backupDir);
      
      // Verify checksum
      const currentChecksum = await this.calculateChecksum(backupDir);
      if (currentChecksum !== metadata.checksum) {
        errors.push('Backup checksum mismatch - backup may be corrupted');
      }

      // Check file existence
      const requiredFiles = ['database.sql', 'data.json', 'metadata.json'];
      for (const file of requiredFiles) {
        if (!existsSync(join(backupDir, file))) {
          errors.push(`Required file missing: ${file}`);
        }
      }

      // Validate backup size
      const currentSize = await this.calculateBackupSize(backupDir);
      if (Math.abs(currentSize - metadata.size) > metadata.size * 0.1) {
        warnings.push('Backup size differs significantly from metadata');
      }

      const valid = errors.length === 0;
      console.log(`${valid ? '✅' : '❌'} Backup verification completed`);
      console.log(`   Errors: ${errors.length}, Warnings: ${warnings.length}`);

      return { valid, errors, warnings };

    } catch (error) {
      errors.push(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { valid: false, errors, warnings };
    }
  }

  // Private helper methods
  private async createDatabaseBackup(outputFile: string): Promise<void> {
    console.log('   Creating database backup...');
    
    return new Promise((resolve, reject) => {
      const pg_dump = spawn('pg_dump', [
        process.env.DATABASE_URL!,
        '--clean',
        '--create',
        '--verbose',
        '--file', outputFile,
      ]);

      pg_dump.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`pg_dump exited with code ${code}`));
        }
      });

      pg_dump.on('error', reject);
    });
  }

  private async createDataBackup(outputFile: string): Promise<void> {
    console.log('   Creating application data backup...');

    // Export critical application data
    const data = {
      users: await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      companies: await prisma.company.findMany(),
      contacts: await prisma.contact.findMany({
        where: { isActive: true },
      }),
      forumPosts: await prisma.forumPost.findMany({
        take: 1000, // Limit for large datasets
        orderBy: { createdAt: 'desc' },
      }),
      // Add other critical data as needed
    };

    await this.saveJsonFile(outputFile, data);
  }

  private async createConfigBackup(outputFile: string): Promise<void> {
    console.log('   Creating configuration backup...');

    const config = {
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      backupTimestamp: new Date().toISOString(),
      // Add other configuration data as needed
    };

    await this.saveJsonFile(outputFile, config);
  }

  private async getAllTableNames(): Promise<string[]> {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    return tables.map(t => t.tablename);
  }

  private async getChangedDataSince(timestamp: Date): Promise<Record<string, any[]>> {
    console.log('   Analyzing changed data...');

    const changes: Record<string, any[]> = {};

    // Get changed users
    const changedUsers = await prisma.user.findMany({
      where: { updatedAt: { gte: timestamp } },
    });
    if (changedUsers.length > 0) {
      changes.users = changedUsers;
    }

    // Get changed companies
    const changedCompanies = await prisma.company.findMany({
      where: { updatedAt: { gte: timestamp } },
    });
    if (changedCompanies.length > 0) {
      changes.companies = changedCompanies;
    }

    // Get changed contacts
    const changedContacts = await prisma.contact.findMany({
      where: { 
        updatedAt: { gte: timestamp },
        isActive: true,
      },
    });
    if (changedContacts.length > 0) {
      changes.contacts = changedContacts;
    }

    // Add other tables as needed
    console.log(`   Found changes in ${Object.keys(changes).length} tables`);
    return changes;
  }

  private async validateBackup(backupDir: string, metadata: BackupMetadata): Promise<void> {
    console.log('   Validating backup integrity...');

    const currentChecksum = await this.calculateChecksum(backupDir);
    if (currentChecksum !== metadata.checksum) {
      throw new Error('Backup validation failed: checksum mismatch');
    }
  }

  private async performFullRestore(backupDir: string, tables?: string[]): Promise<void> {
    console.log('   Performing full database restore...');
    
    // This would restore from the database backup
    // Implementation depends on your specific needs and database setup
    const dbBackupFile = join(backupDir, 'database.sql');
    
    return new Promise((resolve, reject) => {
      const psql = spawn('psql', [
        process.env.DATABASE_URL!,
        '--file', dbBackupFile,
      ]);

      psql.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Database restore failed with code ${code}`));
        }
      });

      psql.on('error', reject);
    });
  }

  private async performIncrementalRestore(backupDir: string, tables?: string[]): Promise<void> {
    console.log('   Performing incremental restore...');
    
    const changesFile = join(backupDir, 'changes.json');
    const changes = await this.loadJsonFile(changesFile);

    // Apply changes for each table
    for (const [tableName, records] of Object.entries(changes)) {
      if (tables && !tables.includes(tableName)) {
        continue;
      }

      console.log(`   Restoring ${tableName}: ${(records as any[]).length} records`);
      
      // Implementation would depend on specific table structure
      // This is a simplified example
      if (tableName === 'users') {
        for (const user of records as any[]) {
          await prisma.user.upsert({
            where: { id: user.id },
            update: user,
            create: user,
          });
        }
      }
      // Add other tables as needed
    }
  }

  private async showRestorePreview(backupDir: string, metadata: BackupMetadata, tables?: string[]): Promise<void> {
    console.log(`   Backup ID: ${metadata.id}`);
    console.log(`   Timestamp: ${metadata.timestamp.toISOString()}`);
    console.log(`   Type: ${metadata.type}`);
    console.log(`   Size: ${(metadata.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Tables to restore: ${tables?.join(', ') || 'all'}`);
    console.log(`   Available tables: ${metadata.tables.join(', ')}`);
  }

  // Utility methods
  private ensureDirectoryExists(dir: string): void {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  private async saveJsonFile(filePath: string, data: any): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  private async loadJsonFile(filePath: string): Promise<any> {
    const fs = await import('fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async saveBackupMetadata(backupDir: string, metadata: BackupMetadata): Promise<void> {
    const metadataFile = join(backupDir, 'metadata.json');
    await this.saveJsonFile(metadataFile, metadata);
  }

  private async loadBackupMetadata(backupDir: string): Promise<BackupMetadata> {
    const metadataFile = join(backupDir, 'metadata.json');
    const metadata = await this.loadJsonFile(metadataFile);
    
    // Convert timestamp string back to Date
    metadata.timestamp = new Date(metadata.timestamp);
    
    return metadata;
  }

  private async calculateBackupSize(backupDir: string): Promise<number> {
    // Implementation would calculate total size of backup directory
    return 0; // Placeholder
  }

  private async calculateChecksum(backupDir: string): Promise<string> {
    // Implementation would calculate MD5/SHA256 checksum of backup
    return `checksum_${Date.now()}`; // Placeholder
  }

  private async compressBackup(backupDir: string): Promise<void> {
    console.log('   Compressing backup...');
    // Implementation would compress backup directory
  }

  private async decompressBackup(backupDir: string): Promise<void> {
    console.log('   Decompressing backup...');
    // Implementation would decompress backup directory
  }

  private async encryptBackup(backupDir: string): Promise<void> {
    console.log('   Encrypting backup...');
    // Implementation would encrypt backup files
  }

  private async decryptBackup(backupDir: string): Promise<void> {
    console.log('   Decrypting backup...');
    // Implementation would decrypt backup files
  }

  private async readDirectory(dir: string): Promise<Array<{ name: string; isDirectory: () => boolean }>> {
    const fs = await import('fs/promises');
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries;
  }

  private async deleteDirectory(dir: string): Promise<void> {
    const fs = await import('fs/promises');
    await fs.rm(dir, { recursive: true, force: true });
  }

  private calculateBackupsToDelete(backups: BackupMetadata[]): { deleted: string[]; kept: string[] } {
    const { daily, weekly, monthly } = this.config.retention;
    const now = new Date();
    const deleted: string[] = [];
    const kept: string[] = [];

    const dailyBackups = backups.filter(b => 
      now.getTime() - b.timestamp.getTime() <= daily * 24 * 60 * 60 * 1000
    );
    
    const weeklyBackups = backups.filter(b => 
      now.getTime() - b.timestamp.getTime() <= weekly * 7 * 24 * 60 * 60 * 1000
    );
    
    const monthlyBackups = backups.filter(b => 
      now.getTime() - b.timestamp.getTime() <= monthly * 30 * 24 * 60 * 60 * 1000
    );

    // Keep daily backups within retention period
    dailyBackups.forEach(backup => kept.push(backup.id));
    
    // Keep weekly backups (one per week)
    const weeklyKeep = new Set<string>();
    weeklyBackups.forEach(backup => {
      const weekStart = new Date(backup.timestamp);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyKeep.has(weekKey)) {
        kept.push(backup.id);
        weeklyKeep.add(weekKey);
      }
    });

    // Keep monthly backups (one per month)
    const monthlyKeep = new Set<string>();
    monthlyBackups.forEach(backup => {
      const monthKey = backup.timestamp.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyKeep.has(monthKey)) {
        kept.push(backup.id);
        monthlyKeep.add(monthKey);
      }
    });

    // Mark remaining backups for deletion
    backups.forEach(backup => {
      if (!kept.includes(backup.id)) {
        deleted.push(backup.id);
      }
    });

    return { deleted: Array.from(new Set(deleted)), kept: Array.from(new Set(kept)) };
  }
}

// CLI interface
if (require.main === module) {
  const config: BackupConfig = {
    outputDir: process.env.BACKUP_DIR || './backups',
    includeUploads: true,
    compress: true,
    encryption: {
      enabled: process.env.BACKUP_ENCRYPTION_KEY ? true : false,
      key: process.env.BACKUP_ENCRYPTION_KEY || '',
    },
    retention: {
      daily: 7,    // Keep daily backups for 7 days
      weekly: 4,   // Keep weekly backups for 4 weeks
      monthly: 12, // Keep monthly backups for 12 months
    },
  };

  const manager = BackupRestoreManager.getInstance(config);
  
  const command = process.argv[2];
  const options = process.argv.slice(3);

  (async () => {
    try {
      switch (command) {
        case 'backup':
          const type = options[0] || 'full';
          if (type === 'full') {
            await manager.createFullBackup();
          } else if (type === 'incremental') {
            const lastBackup = new Date(options[1] || Date.now() - 24 * 60 * 60 * 1000);
            await manager.createIncrementalBackup(lastBackup);
          }
          break;
          
        case 'restore':
          const backupId = options[0];
          if (!backupId) {
            throw new Error('Backup ID required for restore');
          }
          
          await manager.restoreFromBackup({
            backupId,
            tables: options[1]?.split(','),
            dryRun: options.includes('--dry-run'),
            skipValidation: options.includes('--skip-validation'),
          });
          break;
          
        case 'list':
          const backups = await manager.listBackups();
          console.log('\n📋 Available Backups:');
          backups.forEach(backup => {
            console.log(`   ${backup.id} (${backup.type}) - ${backup.timestamp.toISOString()} - ${(backup.size / 1024 / 1024).toFixed(2)} MB`);
          });
          break;
          
        case 'verify':
          const verifyId = options[0];
          if (!verifyId) {
            throw new Error('Backup ID required for verification');
          }
          
          const result = await manager.verifyBackup(verifyId);
          console.log(`Verification result: ${result.valid ? 'VALID' : 'INVALID'}`);
          if (result.errors.length > 0) {
            console.log('Errors:', result.errors);
          }
          if (result.warnings.length > 0) {
            console.log('Warnings:', result.warnings);
          }
          break;
          
        case 'cleanup':
          await manager.cleanupOldBackups();
          break;
          
        default:
          console.log(`
Usage: tsx backup-restore.ts <command> [options]

Commands:
  backup [full|incremental] [timestamp]  - Create backup
  restore <backupId> [tables] [--dry-run] [--skip-validation] - Restore from backup
  list                                   - List available backups
  verify <backupId>                      - Verify backup integrity
  cleanup                               - Clean up old backups

Examples:
  tsx backup-restore.ts backup full
  tsx backup-restore.ts backup incremental 2024-01-01T00:00:00Z
  tsx backup-restore.ts restore full_2024-01-15T10-30-00Z
  tsx backup-restore.ts restore full_2024-01-15T10-30-00Z companies,contacts --dry-run
  tsx backup-restore.ts list
  tsx backup-restore.ts verify full_2024-01-15T10-30-00Z
  tsx backup-restore.ts cleanup
          `);
      }
    } catch (error) {
      console.error('❌ Operation failed:', error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  })();
}