import { Controller, Get, Post, Delete, Param, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../user/user.entity';

@Controller('migrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Get('status')
  async getMigrationStatus() {
    return await this.migrationService.getMigrationStatus();
  }

  @Post('reset/:migrationName')
  async resetMigration(@Param('migrationName') migrationName: string) {
    await this.migrationService.rollbackMigration(migrationName);
    return { message: `Migration ${migrationName} has been reset` };
  }
}
