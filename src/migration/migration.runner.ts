import { DataSource } from 'typeorm';
import { Migration } from './migration.entity';
import * as fs from 'fs';
import * as path from 'path';

export interface MigrationFile {
  name: string;
  timestamp: number;
  path: string;
  migration: any;
}

export class MigrationRunner {
  constructor(private dataSource: DataSource) {}

  async runMigrations(): Promise<void> {
    console.log('🚀 Running migrations...');
    
    const migrationRepository = this.dataSource.getRepository(Migration);
    const executedMigrations = await migrationRepository.find();
    const executedNames = new Set(executedMigrations.map(m => m.name));
    
    const migrationFiles = this.loadMigrationFiles();
    const pendingMigrations = migrationFiles.filter(m => !executedNames.has(m.name));
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }
    
    // Sort by timestamp to ensure proper order
    pendingMigrations.sort((a, b) => a.timestamp - b.timestamp);
    
    for (const migrationFile of pendingMigrations) {
      console.log(`📝 Running migration: ${migrationFile.name}`);
      
      try {
        const migration = new migrationFile.migration();
        await migration.up(this.dataSource.createQueryRunner());
        
        // Mark as executed
        const migrationRecord = migrationRepository.create({
          name: migrationFile.name,
          description: `Executed migration: ${migrationFile.name}`,
          executed: true,
        });
        await migrationRepository.save(migrationRecord);
        
        console.log(`✅ Migration ${migrationFile.name} completed`);
      } catch (error) {
        console.error(`❌ Migration ${migrationFile.name} failed:`, error);
        throw error;
      }
    }
    
    console.log('🎉 All migrations completed successfully');
  }

  private loadMigrationFiles(): MigrationFile[] {
    const migrationsPath = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsPath);
    
    const migrationFiles: MigrationFile[] = [];
    
    for (const file of files) {
      if (file.endsWith('.ts')) {
        const match = file.match(/^(\d+)_(.+)\.ts$/);
        if (match) {
          const timestamp = parseInt(match[1]);
          const name = match[2];
          const fullPath = path.join(migrationsPath, file);
          
          try {
            // Dynamic import of migration file
            const migrationModule = require(fullPath);
            const migrationClass = Object.values(migrationModule)[0] as any;
            
            migrationFiles.push({
              name: `${timestamp}_${name}`,
              timestamp,
              path: fullPath,
              migration: migrationClass,
            });
          } catch (error) {
            console.warn(`⚠️  Could not load migration file ${file}:`, error);
          }
        }
      }
    }
    
    return migrationFiles;
  }

  async getMigrationStatus(): Promise<Migration[]> {
    const migrationRepository = this.dataSource.getRepository(Migration);
    return await migrationRepository.find({
      order: { executedAt: 'ASC' },
    });
  }

  async rollbackMigration(migrationName: string): Promise<void> {
    const migrationRepository = this.dataSource.getRepository(Migration);
    const migrationRecord = await migrationRepository.findOne({
      where: { name: migrationName },
    });
    
    if (!migrationRecord) {
      throw new Error(`Migration ${migrationName} not found`);
    }
    
    // Load and run down migration
    const migrationsPath = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsPath);
    
    for (const file of files) {
      if (file.includes(migrationName)) {
        const fullPath = path.join(migrationsPath, file);
        const migrationModule = require(fullPath);
        const migrationClass = Object.values(migrationModule)[0] as any;
        
        console.log(`🔄 Rolling back migration: ${migrationName}`);
        
        try {
          const migration = new migrationClass();
          await migration.down(this.dataSource.createQueryRunner());
          
          // Remove from migrations table
          await migrationRepository.remove(migrationRecord);
          
          console.log(`✅ Migration ${migrationName} rolled back successfully`);
          return;
        } catch (error) {
          console.error(`❌ Rollback failed for ${migrationName}:`, error);
          throw error;
        }
      }
    }
    
    throw new Error(`Migration file for ${migrationName} not found`);
  }
}
