import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('applications')
@Index(['userId', 'courseId'], { unique: true }) // Prevent duplicate applications
@Index(['studentEmail'], { unique: true }) // Prevent duplicate student email
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentName: string;

  @Column({ unique: true })
  studentEmail: string;

  @Column({ unique: true })
  mobileNumber: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ type: 'text', nullable: true })
  additionalInfo: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @Column()
  submittedBy: string; // User who submitted the application

  @ManyToOne(() => Course, { eager: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string; // Foreign key to users table

  @CreateDateColumn()
  submittedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
