
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('list_options')
export class OptionList {
  @PrimaryColumn('varchar', { length: 8 })
  id: string = uuidv4().substring(0, 8);

  @Column()
  name!: string;

  @Column()
  list_data!: string;

  @Column({ nullable: true })
  version!: string;

  @Column({ nullable: true })
  supercedes!: string;

  @Column()
  author!: string;

  @CreateDateColumn()
  created_on!: Date;

  @UpdateDateColumn()
  updated_on!: Date;
}
