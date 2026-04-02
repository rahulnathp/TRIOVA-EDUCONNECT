import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(courseData: Partial<Course>): Promise<Course> {
    const course = this.courseRepository.create(courseData);
    return await this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { isActive: true },
    });
  }

  async findById(id: string): Promise<Course | undefined> {
    return await this.courseRepository.findOne({ 
      where: { id, isActive: true } 
    });
  }

  async findByCountry(country: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { country, isActive: true },
    });
  }

  async findByCollege(collegeName: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { collegeName, isActive: true },
    });
  }

  async findByStudyLevel(studyLevel: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { studyLevel, isActive: true },
    });
  }

  async findByIntake(intake: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { intake, isActive: true },
    });
  }

  async getCoursesWithAvailableSeats(): Promise<Course[]> {
    return await this.courseRepository
      .createQueryBuilder('course')
      .where('course.isActive = :isActive', { isActive: true })
      .andWhere('course.seatsAvailable > :seats', { seats: 0 })
      .getMany();
  }

  async getCoursesByFeeRange(minFees?: number, maxFees?: number): Promise<Course[]> {
    const queryBuilder = this.courseRepository.createQueryBuilder('course')
      .where('course.isActive = :isActive', { isActive: true });

    if (minFees !== undefined) {
      queryBuilder.andWhere('course.tuitionFees >= :minFees', { minFees });
    }

    if (maxFees !== undefined) {
      queryBuilder.andWhere('course.tuitionFees <= :maxFees', { maxFees });
    }

    return await queryBuilder.getMany();
  }

  async updateSeats(id: string, seats: number): Promise<Course | null> {
    await this.courseRepository.update(id, { seatsAvailable: seats });
    return await this.findById(id);
  }

  async searchCourses(searchTerm: string): Promise<Course[]> {
    return await this.courseRepository
      .createQueryBuilder('course')
      .where('course.collegeName ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('course.courseName ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('course.country ILIKE :search', { search: `%${searchTerm}%` })
      .andWhere('course.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async update(id: string, courseData: Partial<Course>): Promise<Course | null> {
    await this.courseRepository.update(id, courseData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.courseRepository.update(id, { isActive: false });
    return result.affected > 0;
  }

  async getCourseStats(): Promise<any> {
    const courses = await this.findAll();
    const countries = [...new Set(courses.map(course => course.country))];
    const colleges = [...new Set(courses.map(course => course.collegeName))];
    
    return {
      totalCourses: courses.length,
      totalCountries: countries.length,
      totalColleges: colleges.length,
      countries: countries,
      colleges: colleges,
      coursesByCountry: countries.map(country => ({
        country,
        count: courses.filter(course => course.country === country).length
      })),
      coursesByCollege: colleges.map(college => ({
        college,
        count: courses.filter(course => course.collegeName === college).length
      }))
    };
  }
}
