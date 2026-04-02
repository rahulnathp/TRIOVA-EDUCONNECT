import { MigrationInterface, QueryRunner } from 'typeorm';
import { Course } from '../../course/course.entity';

export class SeedCourses1712042500000 implements MigrationInterface {
  name = '1712042500000_seed_courses';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const courseRepository = queryRunner.manager.getRepository(Course);
    
    const existingCourses = await courseRepository.find();
    if (existingCourses.length === 0) {
      const sampleCourses = [
        {
          collegeName: 'Harvard University',
          country: 'USA',
          courseName: 'Computer Science',
          description: 'Bachelor of Science in Computer Science',
          tuitionFees: 50000,
          seatsAvailable: 120,
          livingExpenses: 20000,
          totalCost: 70000,
          currency: 'USD',
          duration: '4 years',
          studyLevel: 'Bachelor',
          intake: 'Fall 2024',
          requirements: {
            academic: 'High school diploma with strong math background',
            english: 'TOEFL 100 or IELTS 7.0',
            other: 'SAT optional but recommended',
          },
          contactInfo: {
            email: 'admissions@harvard.edu',
            phone: '+1-617-495-1550',
            website: 'https://harvard.edu',
            address: 'Cambridge, MA 02138, USA',
          },
          isActive: true,
        },
        {
          collegeName: 'Stanford University',
          country: 'USA',
          courseName: 'Business Administration',
          description: 'MBA Program',
          tuitionFees: 75000,
          seatsAvailable: 80,
          livingExpenses: 25000,
          totalCost: 100000,
          currency: 'USD',
          duration: '2 years',
          studyLevel: 'Master',
          intake: 'Fall 2024',
          requirements: {
            academic: 'Bachelor degree with 3+ years work experience',
            english: 'TOEFL 105 or IELTS 7.5',
            other: 'GMAT or GRE required',
          },
          contactInfo: {
            email: 'mba@stanford.edu',
            phone: '+1-650-723-2717',
            website: 'https://gsb.stanford.edu',
            address: 'Stanford, CA 94305, USA',
          },
          isActive: true,
        },
        {
          collegeName: 'University of Oxford',
          country: 'UK',
          courseName: 'Engineering Science',
          description: 'Master of Engineering in Engineering Science',
          tuitionFees: 35000,
          seatsAvailable: 150,
          livingExpenses: 15000,
          totalCost: 50000,
          currency: 'GBP',
          duration: '4 years',
          studyLevel: 'Master',
          intake: 'October 2024',
          requirements: {
            academic: 'A-levels in Mathematics and Physics',
            english: 'IELTS 7.0 or TOEFL 100',
            other: 'Interview required',
          },
          contactInfo: {
            email: 'admissions@ox.ac.uk',
            phone: '+44-1865-272300',
            website: 'https://ox.ac.uk',
            address: 'Oxford OX1 2JD, UK',
          },
          isActive: true,
        },
        {
          collegeName: 'University of Toronto',
          country: 'Canada',
          courseName: 'Data Science',
          description: 'Master of Science in Data Science',
          tuitionFees: 30000,
          seatsAvailable: 100,
          livingExpenses: 12000,
          totalCost: 42000,
          currency: 'CAD',
          duration: '2 years',
          studyLevel: 'Master',
          intake: 'September 2024',
          requirements: {
            academic: 'Bachelor degree in Computer Science or related field',
            english: 'IELTS 7.0 or TOEFL 93',
            other: 'Programming experience required',
          },
          contactInfo: {
            email: 'admissions@utoronto.ca',
            phone: '+1-416-978-2011',
            website: 'https://utoronto.ca',
            address: 'Toronto, ON M5S 1A1, Canada',
          },
          isActive: true,
        },
        {
          collegeName: 'University of Melbourne',
          country: 'Australia',
          courseName: 'Medicine',
          description: 'Doctor of Medicine',
          tuitionFees: 55000,
          seatsAvailable: 60,
          livingExpenses: 18000,
          totalCost: 73000,
          currency: 'AUD',
          duration: '4 years',
          studyLevel: 'Doctor',
          intake: 'February 2024',
          requirements: {
            academic: 'Bachelor degree with science background',
            english: 'IELTS 7.0 or TOEFL 94',
            other: 'MCAT or GAMSAT required',
          },
          contactInfo: {
            email: 'md-info@unimelb.edu.au',
            phone: '+61-3-8344-4000',
            website: 'https://unimelb.edu.au',
            address: 'Parkville, VIC 3010, Australia',
          },
          isActive: true,
        },
      ];

      for (const courseData of sampleCourses) {
        const course = courseRepository.create(courseData);
        await courseRepository.save(course);
      }
      console.log(`✓ Seeded ${sampleCourses.length} sample courses`);
    } else {
      console.log('✓ Courses already exist, skipping seeding');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const courseRepository = queryRunner.manager.getRepository(Course);
    await courseRepository.delete({});
    console.log('✓ All courses deleted');
  }
}
