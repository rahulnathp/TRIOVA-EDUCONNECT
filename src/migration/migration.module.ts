import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MigrationService } from './migration.service';
import { MigrationController } from './migration.controller';
import { Migration } from './migration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Migration])],
  controllers: [MigrationController],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationModule {}
