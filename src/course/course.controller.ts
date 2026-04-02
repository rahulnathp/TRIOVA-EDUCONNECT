import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { Course } from './course.entity';
import { SkipAuth } from '../auth/skip-auth.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../user/user.entity';
import { AddCourseDto } from './dto/add-course.dto';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async addCourse(@Body() courseData: AddCourseDto): Promise<Course> {
    try {
      return await this.courseService.create(courseData);
    } catch (error) {
      throw new HttpException('Failed to add course', HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() courseData: Partial<Course>): Promise<Course> {
    try {
      return await this.courseService.create(courseData);
    } catch (error) {
      throw new HttpException('Failed to create course', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @SkipAuth()
  async findAll(): Promise<Course[]> {
    return await this.courseService.findAll();
  }

  @Get('search')
  @SkipAuth()
  async searchCourses(@Query('q') searchTerm: string): Promise<Course[]> {
    if (!searchTerm) {
      throw new HttpException('Search term is required', HttpStatus.BAD_REQUEST);
    }
    return await this.courseService.searchCourses(searchTerm);
  }

  @Get('country/:country')
  @SkipAuth()
  async findByCountry(@Param('country') country: string): Promise<Course[]> {
    return await this.courseService.findByCountry(country);
  }

  @Get('college/:college')
  @SkipAuth()
  async findByCollege(@Param('college') college: string): Promise<Course[]> {
    return await this.courseService.findByCollege(college);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(): Promise<any> {
    return await this.courseService.getCourseStats();
  }

  @Get('by-intake/:intake')
  @SkipAuth()
  async findByIntake(@Param('intake') intake: string): Promise<Course[]> {
    return await this.courseService.findByIntake(intake);
  }

  @Get('available-seats')
  @SkipAuth()
  async getCoursesWithAvailableSeats(): Promise<Course[]> {
    return await this.courseService.getCoursesWithAvailableSeats();
  }

  @Get('by-fees')
  @SkipAuth()
  async getCoursesByFeeRange(
    @Query('min') minFees?: string,
    @Query('max') maxFees?: string
  ): Promise<Course[]> {
    const min = minFees ? parseFloat(minFees) : undefined;
    const max = maxFees ? parseFloat(maxFees) : undefined;
    return await this.courseService.getCoursesByFeeRange(min, max);
  }

  @Get(':id')
  @SkipAuth()
  async findById(@Param('id') id: string): Promise<Course> {
    const course = await this.courseService.findById(id);
    if (!course) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }
    return course;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() courseData: Partial<Course>): Promise<Course> {
    const course = await this.courseService.update(id, courseData);
    if (!course) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }
    return course;
  }

  @Put(':id/seats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateSeats(@Param('id') id: string, @Body('seats') seats: number): Promise<Course> {
    const course = await this.courseService.updateSeats(id, seats);
    if (!course) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }
    return course;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    const success = await this.courseService.delete(id);
    if (!success) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Course deleted successfully' };
  }
}
