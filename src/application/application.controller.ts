import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { Application, ApplicationStatus } from './application.entity';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../user/user.entity';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  async submitApplication(@Request() req: any, @Body() applicationData: SubmitApplicationDto): Promise<Application> {
    try {
      const userId = req.user.id;
      return await this.applicationService.submitApplication(userId, applicationData);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to submit application', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllApplications(): Promise<Application[]> {
    return await this.applicationService.findAll();
  }

  @Get('my-applications')
  @UseGuards(JwtAuthGuard)
  async getMyApplications(@Request() req: any): Promise<Application[]> {
    const userId = req.user.id;
    return await this.applicationService.findByUserId(userId);
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getApplicationsByStatus(@Param('status') status: ApplicationStatus): Promise<Application[]> {
    return await this.applicationService.findByStatus(status);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getApplicationStats(): Promise<any> {
    return await this.applicationService.getApplicationStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getApplicationById(@Param('id') id: string, @Request() req: any): Promise<Application> {
    const application = await this.applicationService.findById(id);
    
    if (!application) {
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    }

    // Users can only view their own applications, admins can view all
    if (req.user.role !== UserRole.ADMIN && application.userId !== req.user.id) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    return application;
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() updateData: { status: ApplicationStatus; adminNotes?: string }
  ): Promise<Application> {
    const application = await this.applicationService.updateApplicationStatus(
      id,
      updateData.status,
      updateData.adminNotes
    );

    if (!application) {
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    }

    return application;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteApplication(@Param('id') id: string, @Request() req: any): Promise<{ message: string }> {
    const application = await this.applicationService.findById(id);
    
    if (!application) {
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    }

    // Users can only delete their own applications, admins can delete all
    if (req.user.role !== UserRole.ADMIN && application.userId !== req.user.id) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    const success = await this.applicationService.deleteApplication(id);
    if (!success) {
      throw new HttpException('Failed to delete application', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { message: 'Application deleted successfully' };
  }
}
