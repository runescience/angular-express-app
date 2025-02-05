
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('question_types')
export class QuestionType {
  @PrimaryColumn('varchar', { length: 8 })
  question_type_id: string = uuidv4().substring(0, 8);

  @Column({ unique: true })
  type!: string;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ default: false })
  has_regex!: boolean;

  @Column({ nullable: true })
  regex_str!: string;

  @Column({ default: false })
  has_options!: boolean;

  @Column({ nullable: true })
  options_str!: string;

  @Column({ default: false })
  has_supplemental!: boolean;

  @Column({ nullable: true })
  supplemental_str!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column()
  author!: string;
}
