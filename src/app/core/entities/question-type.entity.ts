import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('question_types')
export class QuestionTypeEntity {
  @PrimaryColumn('varchar', { length: 8 })
  question_type_id: string = uuidv4().substring(0, 8);

  @Column()
  type!: string;

  @Column({ default: true })
  is_active: boolean = true;

  @Column({ default: false })
  has_regex!: boolean;

  @Column({ nullable: true })
  regex_str?: string;

  @Column({ default: false )
  has_options: boolean = false;

  @Column({ nullable: true })
  options_str?: string;

  @Column({ default: false })
  has_supplemental: boolean = false;

  @Column({ nullable: true })
  supplemental_str?: string;

  @CreateDateColumn()
  created_on: Date = new Date();

  @UpdateDateColumn()
  updated_on: Date = new Date()

  @Column({ nullable: true })
  author?: string;

  constructor(data: Partial<QuestionTypeEntity>) {
    Object.assign(this, data);
  }
}
