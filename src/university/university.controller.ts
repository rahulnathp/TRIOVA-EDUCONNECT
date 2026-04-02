import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { UniversityService } from './university.service';
import { University } from './university.entity';
import { CreateUniversityDto } from './dto/create-university.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../user/user.entity';
import { SkipAuth } from '../auth/skip-auth.decorator';

@Controller('universities')
export class UniversityController {
  constructor(private readonly universityService: UniversityService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() universityData: any): Promise<University> {
    try {
      return await this.universityService.create(universityData);
    } catch (error) {
      throw new HttpException('Failed to create university', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<University[]> {
    return await this.universityService.findAll();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async searchUniversities(@Query('q') searchTerm: string): Promise<University[]> {
    if (!searchTerm) {
      throw new HttpException('Search term is required', HttpStatus.BAD_REQUEST);
    }
    return await this.universityService.searchUniversities(searchTerm);
  }

  @Get('country/:country')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findByCountry(@Param('country') country: string): Promise<University[]> {
    return await this.universityService.findByCountry(country);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats(): Promise<any> {
    return await this.universityService.getUniversityStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findById(@Param('id') id: string): Promise<University> {
    const university = await this.universityService.findById(id);
    if (!university) {
      throw new HttpException('University not found', HttpStatus.NOT_FOUND);
    }
    return university;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() universityData: any): Promise<University> {
    const university = await this.universityService.update(id, universityData);
    if (!university) {
      throw new HttpException('University not found', HttpStatus.NOT_FOUND);
    }
    return university;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    const success = await this.universityService.delete(id);
    if (!success) {
      throw new HttpException('University not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'University deleted successfully' };
  }
}
