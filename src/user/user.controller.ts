import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() userData: Partial<User>): Promise<User> {
    try {
      return await this.userService.create(userData);
    } catch (error) {
      throw new HttpException('Failed to create user', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() userData: Partial<User>): Promise<User> {
    const user = await this.userService.update(id, userData);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    const success = await this.userService.delete(id);
    if (!success) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'User deleted successfully' };
  }
}
