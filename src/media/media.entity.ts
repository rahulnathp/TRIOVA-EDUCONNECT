import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('brochures')
export class Brochure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  fileName: string;

  @Column()
  s3Key: string;

  @Column()
  s3Url: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  fileName: string;

  @Column()
  s3Key: string;

  @Column()
  s3Url: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
