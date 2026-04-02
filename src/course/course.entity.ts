import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  collegeName: string;

  @Column()
  country: string;

  @Column()
  courseName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tuitionFees: number;

  @Column({ type: 'int', nullable: true })
  seatsAvailable: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  livingExpenses: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true })
  studyLevel: string;

  @Column({ nullable: true })
  intake: string;

  @Column({ type: 'json', nullable: true })
  requirements: {
    academic?: string;
    english?: string;
    other?: string;
  };

  @Column({ type: 'json', nullable: true })
  contactInfo: {
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
