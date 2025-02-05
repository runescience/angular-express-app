
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('questions')
export class Question {
  @PrimaryColumn('varchar', { length: 8 })
  question_id: string = uuidv4().substring(0, 8);

  @Column()
  question_text!: string;

  @Column({ nullable: true })
  question_help!: string;

  @Column()
  question_type_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column()
  author!: string;

  @Column({ default: true })
  is_active!: boolean;
}
