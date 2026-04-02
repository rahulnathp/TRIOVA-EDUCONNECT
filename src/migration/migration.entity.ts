import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('migrations')
export class Migration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: true })
  executed: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  executedAt: Date;
}
