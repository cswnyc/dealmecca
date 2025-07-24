#!/usr/bin/env npx tsx

/**
 * Production Database State Verification
 * 
 * Comprehensive check of database schema, data, and performance
 */

import { prisma } from '../../lib/prisma';

interface TableInfo {
  table_name: string;
  column_count: number;
  row_count: number;
}

interface MigrationInfo {
  id: string;
  checksum: string;
  finished_at: Date | null;
  migration_name: string;
  rolled_back_at: Date | null;
  started_at: Date;
  applied_steps_count: number;
}

async function checkDatabaseConnection() {
  console.log(`🔗 TESTING DATABASE CONNECTION`);
  console.log(`==============================\n`);

  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as connection_test`;
    const duration = Date.now() - startTime;
    
    console.log(`✅ Database connection successful (${duration}ms)`);
    
    // Check database version and info
    const dbInfo = await prisma.$queryRaw`
      SELECT version() as version, 
             current_database() as database_name,
             current_user as user_name,
             inet_server_addr() as server_ip
    ` as any[];
    
    if (dbInfo[0]) {
      console.log(`📊 Database Info:`);
      console.log(`   Database: ${dbInfo[0].database_name}`);
      console.log(`   User: ${dbInfo[0].user_name}`);
      console.log(`   Version: ${dbInfo[0].version.split(' ')[0]} ${dbInfo[0].version.split(' ')[1]}`);
      if (dbInfo[0].server_ip) {
        console.log(`   Server IP: ${dbInfo[0].server_ip}`);
      }
    }
    
    return true;
  } catch (error: any) {
    console.log(`❌ Database connection failed: ${error.message}`);
    return false;
  }
}

async function checkDatabaseSchema() {
  console.log(`\n🗄️ VERIFYING DATABASE SCHEMA`);
  console.log(`=============================\n`);

  try {
    // Get all tables with column and row counts
    const tables = await prisma.$queryRaw`
      SELECT 
        t.table_name,
        COUNT(c.column_name) as column_count
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c ON t.table_name = c.table_name 
        AND t.table_schema = c.table_schema
      WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND t.table_name NOT LIKE '_prisma%'
      GROUP BY t.table_name
      ORDER BY t.table_name
    ` as { table_name: string; column_count: number }[];

    console.log(`📋 Database Tables Found: ${tables.length}`);
    console.log(`\n📊 Table Details:`);

    const expectedTables = [
      'users', 'companies', 'contacts', 'events', 'eventattendees',
      'forumposts', 'forumcategories', 'searches', 'bookmarks', 'notifications'
    ];

    const foundTables = tables.map(t => t.table_name.toLowerCase());
    const missingTables = expectedTables.filter(t => !foundTables.includes(t));

    for (const table of tables) {
      try {
        // Get row count for each table
        const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
        const rowCount = (result as any)[0]?.count || 0;
        
        const status = expectedTables.includes(table.table_name.toLowerCase()) ? '✅' : '📋';
        console.log(`   ${status} ${table.table_name}: ${table.column_count} columns, ${rowCount} rows`);
      } catch (error) {
        console.log(`   ❌ ${table.table_name}: ${table.column_count} columns, Error counting rows`);
      }
    }

    if (missingTables.length > 0) {
      console.log(`\n⚠️  Missing Expected Tables:`);
      missingTables.forEach(table => {
        console.log(`   ❌ ${table}`);
      });
    } else {
      console.log(`\n✅ All expected tables present`);
    }

    return { tables, missingTables };
  } catch (error: any) {
    console.log(`❌ Schema verification failed: ${error.message}`);
    return { tables: [], missingTables: [] };
  }
}

async function checkSeedData() {
  console.log(`\n🌱 VERIFYING SEED DATA`);
  console.log(`======================\n`);

  try {
    // Check core data counts
    const [
      companyCount,
      contactCount,
      userCount,
      eventCount,
      forumPostCount
    ] = await Promise.all([
      prisma.company.count().catch(() => 0),
      prisma.contact.count().catch(() => 0),
      prisma.user.count().catch(() => 0),
      prisma.event.count().catch(() => 0),
      prisma.forumPost.count().catch(() => 0)
    ]);

    console.log(`📊 Data Counts:`);
    console.log(`   Companies: ${companyCount}`);
    console.log(`   Contacts: ${contactCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Events: ${eventCount}`);
    console.log(`   Forum Posts: ${forumPostCount}`);

    // Check for expected seed companies
    console.log(`\n🏢 Checking Seed Companies:`);
    const expectedCompanies = [
      'WPP Group', 'Omnicom Group', 'Publicis Groupe', 'Interpublic Group',
      'Dentsu Inc.', 'Havas Group', 'MDC Partners', 'Engine Group', 'S4 Capital'
    ];

    const foundCompanies = await prisma.company.findMany({
      where: {
        name: { in: expectedCompanies }
      },
      select: { name: true, industry: true, employeeCount: true }
    });

         foundCompanies.forEach((company: any) => {
       console.log(`   ✅ ${company.name} (${company.industry}, ${company.employeeCount} employees)`);
     });

     const missingCompanies = expectedCompanies.filter(
       name => !foundCompanies.some((c: any) => c.name === name)
     );

    if (missingCompanies.length > 0) {
      console.log(`\n⚠️  Missing Seed Companies:`);
      missingCompanies.forEach(name => {
        console.log(`   ❌ ${name}`);
      });
    }

    // Check data quality
    console.log(`\n🔍 Data Quality Checks:`);
    
    const companiesWithContacts = await prisma.company.count({
      where: {
        contacts: {
          some: {}
        }
      }
    });
    
    const companiesWithoutWebsite = await prisma.company.count({
      where: {
        OR: [
          { website: null },
          { website: '' }
        ]
      }
    });

    const contactsWithEmail = await prisma.contact.count({
      where: {
        email: {
          not: null,
          not: ''
        }
      }
    });

    console.log(`   Companies with contacts: ${companiesWithContacts}/${companyCount}`);
    console.log(`   Companies missing website: ${companiesWithoutWebsite}/${companyCount}`);
    console.log(`   Contacts with email: ${contactsWithEmail}/${contactCount}`);

    return {
      companyCount,
      contactCount,
      userCount,
      eventCount,
      forumPostCount,
      seedStatus: missingCompanies.length === 0 ? 'complete' : 'partial'
    };

  } catch (error: any) {
    console.log(`❌ Seed data verification failed: ${error.message}`);
    return null;
  }
}

async function checkMigrations() {
  console.log(`\n🚀 CHECKING DATABASE MIGRATIONS`);
  console.log(`===============================\n`);

  try {
    // Check if _prisma_migrations table exists
    const migrationTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      )
    ` as { exists: boolean }[];

    if (!migrationTableExists[0]?.exists) {
      console.log(`❌ Migration table not found - database may not be properly initialized`);
      return false;
    }

    // Get migration history
    const migrations = await prisma.$queryRaw`
      SELECT 
        id,
        checksum,
        finished_at,
        migration_name,
        rolled_back_at,
        started_at,
        applied_steps_count
      FROM _prisma_migrations 
      ORDER BY started_at DESC
    ` as MigrationInfo[];

    console.log(`📋 Migration History (${migrations.length} migrations):`);
    
    migrations.forEach((migration, index) => {
      const status = migration.finished_at && !migration.rolled_back_at ? '✅' : 
                    migration.rolled_back_at ? '🔄' : '❌';
      const name = migration.migration_name || migration.id.substring(0, 8);
      const date = migration.started_at ? new Date(migration.started_at).toLocaleDateString() : 'Unknown';
      
      console.log(`   ${status} ${name} (${date})`);
      
      if (index === 0 && migration.finished_at) {
        console.log(`\n✅ Latest migration completed successfully`);
      }
    });

    // Check for pending migrations
    const pendingMigrations = migrations.filter(m => !m.finished_at && !m.rolled_back_at);
    if (pendingMigrations.length > 0) {
      console.log(`\n⚠️  Pending migrations: ${pendingMigrations.length}`);
    }

    return true;
  } catch (error: any) {
    console.log(`❌ Migration check failed: ${error.message}`);
    return false;
  }
}

async function checkDatabasePerformance() {
  console.log(`\n⚡ TESTING DATABASE PERFORMANCE`);
  console.log(`==============================\n`);

  const tests = [
    {
      name: 'Simple Query',
      query: () => prisma.$queryRaw`SELECT 1 as test`
    },
    {
      name: 'Company Count',
      query: () => prisma.company.count()
    },
    {
      name: 'Company Search',
      query: () => prisma.company.findMany({
        where: {
          name: { contains: 'WPP', mode: 'insensitive' }
        },
        take: 5
      })
    },
    {
      name: 'Contact with Company',
      query: () => prisma.contact.findMany({
        include: { company: true },
        take: 5
      })
    },
    {
      name: 'Complex Join Query',
      query: () => prisma.company.findMany({
        include: {
          contacts: {
            take: 3,
            orderBy: { seniority: 'desc' }
          },
          _count: { select: { contacts: true } }
        },
        take: 5
      })
    }
  ];

  for (const test of tests) {
    try {
      const startTime = Date.now();
      await test.query();
      const duration = Date.now() - startTime;
      
      const status = duration < 500 ? '🚀' : 
                    duration < 1000 ? '⚡' : 
                    duration < 2000 ? '⚠️' : '🐌';
      
      console.log(`   ${status} ${test.name}: ${duration}ms`);
    } catch (error: any) {
      console.log(`   ❌ ${test.name}: Error - ${error.message}`);
    }
  }
}

async function checkDatabaseLimits() {
  console.log(`\n💾 DATABASE LIMITS & USAGE`);
  console.log(`==========================\n`);

  try {
    // Check database size (PostgreSQL specific)
    const dbSize = await prisma.$queryRaw`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as size,
        pg_database_size(current_database()) as size_bytes
    ` as { size: string; size_bytes: number }[];

    if (dbSize[0]) {
      console.log(`📊 Database Size: ${dbSize[0].size}`);
    }

    // Check connection limits
    const connections = await prisma.$queryRaw`
      SELECT 
        count(*) as active_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
      FROM pg_stat_activity 
      WHERE state = 'active'
    ` as { active_connections: number; max_connections: number }[];

    if (connections[0]) {
      console.log(`🔗 Connections: ${connections[0].active_connections}/${connections[0].max_connections}`);
    }

    // Check table sizes
    const tableSizes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY size_bytes DESC
      LIMIT 5
    ` as { tablename: string; size: string; size_bytes: number }[];

    console.log(`\n📋 Largest Tables:`);
    tableSizes.forEach(table => {
      console.log(`   📊 ${table.tablename}: ${table.size}`);
    });

  } catch (error: any) {
    console.log(`⚠️  Could not fetch database limits: ${error.message}`);
  }
}

async function generateDatabaseReport() {
  console.log(`\n📋 DATABASE STATE SUMMARY`);
  console.log(`=========================\n`);

  const issues: string[] = [];
  const warnings: string[] = [];
  const successes: string[] = [];

  try {
    // Quick health check
    const [companyCount, contactCount, userCount] = await Promise.all([
      prisma.company.count().catch(() => 0),
      prisma.contact.count().catch(() => 0),
      prisma.user.count().catch(() => 0)
    ]);

    if (companyCount === 0) {
      issues.push('No companies found - seed data missing');
    } else if (companyCount < 5) {
      warnings.push(`Only ${companyCount} companies - expected more seed data`);
    } else {
      successes.push(`${companyCount} companies in database`);
    }

    if (contactCount === 0) {
      issues.push('No contacts found - seed data missing');
    } else {
      successes.push(`${contactCount} contacts in database`);
    }

    if (userCount === 0) {
      warnings.push('No users found - may need user creation');
    } else {
      successes.push(`${userCount} users in database`);
    }

    console.log(`✅ Successes:`);
    successes.forEach(msg => console.log(`   • ${msg}`));

    if (warnings.length > 0) {
      console.log(`\n⚠️  Warnings:`);
      warnings.forEach(msg => console.log(`   • ${msg}`));
    }

    if (issues.length > 0) {
      console.log(`\n❌ Issues:`);
      issues.forEach(msg => console.log(`   • ${msg}`));
    }

    const overallStatus = issues.length > 0 ? '❌ NEEDS ATTENTION' :
                         warnings.length > 0 ? '⚠️ MOSTLY READY' :
                         '✅ READY FOR PRODUCTION';

    console.log(`\n🎯 Overall Status: ${overallStatus}`);

    return {
      status: overallStatus,
      issues,
      warnings,
      successes,
      stats: { companyCount, contactCount, userCount }
    };

  } catch (error: any) {
    console.log(`❌ Could not generate summary: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log(`\n💾 DEALMECCA DATABASE STATE VERIFICATION`);
  console.log(`=======================================`);
  console.log(`📅 Time: ${new Date().toLocaleString()}`);
  console.log(`🌐 Environment: Production\n`);

  const connectionOk = await checkDatabaseConnection();
  if (!connectionOk) {
    console.log(`\n❌ Cannot proceed - database connection failed`);
    process.exit(1);
  }

  const { tables, missingTables } = await checkDatabaseSchema();
  const seedData = await checkSeedData();
  const migrationsOk = await checkMigrations();
  
  await checkDatabasePerformance();
  await checkDatabaseLimits();
  
  const report = await generateDatabaseReport();

  console.log(`\n🔧 NEXT STEPS:`);
  console.log(`=============\n`);

  if (missingTables.length > 0) {
    console.log(`1. Run migrations to create missing tables:`);
    console.log(`   npx prisma migrate deploy\n`);
  }

  if (seedData && seedData.companyCount < 5) {
    console.log(`2. Run database seeding:`);
    console.log(`   npx prisma db seed\n`);
  }

  if (seedData && seedData.userCount === 0) {
    console.log(`3. Create admin user for testing:`);
    console.log(`   Visit: /auth/signup\n`);
  }

  console.log(`4. Test the application:`);
  console.log(`   Visit: https://website-gjgyoiava-cws-projects-e62034bb.vercel.app`);
}

main().catch(console.error); 