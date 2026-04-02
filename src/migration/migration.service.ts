import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MigrationRunner } from './migration.runner';

@Injectable()
export class MigrationService implements OnModuleInit {
  private runner: MigrationRunner;

  constructor(private dataSource: DataSource) {
    this.runner = new MigrationRunner(dataSource);
  }

  async onModuleInit() {
    // Auto-run migrations on startup
    await this.runner.runMigrations();
  }

  async getMigrationStatus() {
    return await this.runner.getMigrationStatus();
  }

  async rollbackMigration(migrationName: string) {
    return await this.runner.rollbackMigration(migrationName);
  }
}
