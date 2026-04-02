import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './application.entity';
import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';
import { SubmitApplicationDto } from './dto/submit-application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async submitApplication(userId: string, applicationData: SubmitApplicationDto): Promise<Application> {
    // Verify course exists
    const course = await this.courseRepository.findOne({
      where: { id: applicationData.courseId, isActive: true },
    });

    if (!course) {
      throw new Error('Course not found or not active');
    }

    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already applied for this course
    const existingApplication = await this.applicationRepository.findOne({
      where: { userId, courseId: applicationData.courseId },
    });

    if (existingApplication) {
      throw new Error('You have already applied for this course');
    }

    // Check if application with same student email already exists
    const existingEmailApplication = await this.applicationRepository.findOne({
      where: { studentEmail: applicationData.studentEmail },
    });

    if (existingEmailApplication) {
      throw new Error(`Application with email '${applicationData.studentEmail}' already exists. One application per student only.`);
    }

    // Check if application with same mobile number already exists
    const existingMobileApplication = await this.applicationRepository.findOne({
      where: { mobileNumber: applicationData.mobileNumber },
    });

    if (existingMobileApplication) {
      throw new Error(`Application with mobile number '${applicationData.mobileNumber}' already exists. One application per student only.`);
    }

    const application = this.applicationRepository.create({
      ...applicationData,
      userId,
      submittedBy: `${user.firstName} ${user.lastName}`, // User who submitted
      status: ApplicationStatus.PENDING,
    });

    const savedApplication = await this.applicationRepository.save(application);
    
    // Return the application with relations loaded
    const fullApplication = await this.applicationRepository.findOne({
      where: { id: savedApplication.id },
      relations: ['course'],
    });
    
    if (!fullApplication) {
      throw new Error('Failed to retrieve saved application');
    }
    
    return fullApplication;
  }

  async findByUserId(userId: string): Promise<Application[]> {
    return await this.applicationRepository.find({
      where: { userId },
      relations: ['course'],
      order: { submittedAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Application | undefined> {
    return await this.applicationRepository.findOne({
      where: { id },
      relations: ['course', 'user'],
    });
  }

  async findAll(): Promise<Application[]> {
    return await this.applicationRepository.find({
      relations: ['course', 'user'],
      order: { submittedAt: 'DESC' },
    });
  }

  async findByStatus(status: ApplicationStatus): Promise<Application[]> {
    return await this.applicationRepository.find({
      where: { status },
      relations: ['course', 'user'],
      order: { submittedAt: 'DESC' },
    });
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus, adminNotes?: string): Promise<Application | null> {
    await this.applicationRepository.update(id, { 
      status, 
      adminNotes: adminNotes || null 
    });
    return await this.findById(id);
  }

  async deleteApplication(id: string): Promise<boolean> {
    const result = await this.applicationRepository.delete(id);
    return result.affected > 0;
  }

  async getApplicationStats(): Promise<any> {
    const applications = await this.findAll();
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === ApplicationStatus.PENDING).length,
      underReview: applications.filter(app => app.status === ApplicationStatus.UNDER_REVIEW).length,
      approved: applications.filter(app => app.status === ApplicationStatus.APPROVED).length,
      rejected: applications.filter(app => app.status === ApplicationStatus.REJECTED).length,
    };
    return stats;
  }
}
