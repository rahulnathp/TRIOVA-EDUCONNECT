import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { MigrationRunner } from './migration.runner';

async function runMigrations() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);
    const runner = new MigrationRunner(dataSource);
    
    await runner.runMigrations();
    
    console.log('🎉 Migration process completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function rollbackMigration(migrationName: string) {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);
    const runner = new MigrationRunner(dataSource);
    
    await runner.rollbackMigration(migrationName);
    
    console.log('🎉 Rollback completed');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function showStatus() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);
    const runner = new MigrationRunner(dataSource);
    
    const migrations = await runner.getMigrationStatus();
    
    console.log('\n📋 Migration Status:');
    console.log('='.repeat(50));
    
    if (migrations.length === 0) {
      console.log('No migrations have been executed yet.');
    } else {
      migrations.forEach((migration, index) => {
        console.log(`${index + 1}. ${migration.name}`);
        console.log(`   Status: ${migration.executed ? '✅ Executed' : '❌ Pending'}`);
        console.log(`   Date: ${migration.executedAt.toLocaleString()}`);
        console.log(`   Description: ${migration.description || 'No description'}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Failed to get status:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// CLI command handling
const command = process.argv[2];
const migrationName = process.argv[3];

switch (command) {
  case 'run':
    runMigrations();
    break;
  case 'rollback':
    if (!migrationName) {
      console.error('❌ Migration name required for rollback');
      console.log('Usage: npm run migration:rollback <migration_name>');
      process.exit(1);
    }
    rollbackMigration(migrationName);
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log('🚀 Migration CLI');
    console.log('Usage:');
    console.log('  npm run migration:run     - Run all pending migrations');
    console.log('  npm run migration:status  - Show migration status');
    console.log('  npm run migration:rollback <name> - Rollback specific migration');
    break;
}
