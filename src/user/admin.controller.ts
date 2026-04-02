import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from './user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  async getAllUsers() {
    return await this.userService.findAll();
  }

  @Get('stats')
  async getAdminStats() {
    const users = await this.userService.findAll();
    const adminCount = users.filter(user => user.role === UserRole.ADMIN).length;
    const userCount = users.filter(user => user.role === UserRole.USER).length;
    
    return {
      totalUsers: users.length,
      adminCount,
      userCount,
    };
  }
}
