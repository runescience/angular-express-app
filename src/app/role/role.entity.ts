// src/app/role/role.entity.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('roles')
export class Role {
  @PrimaryColumn('varchar', { length: 8 })
  role_id: string = uuidv4().substring(0, 8); // UUID-4 for role_id

  @Column({ nullable: false })
  role_name!: string;

  @Column({ nullable: true })
  description!: string;

  @CreateDateColumn()
  created_on!: Date;

  @UpdateDateColumn()
  updated_on!: Date;

  @Column({ default: true })
  is_active!: boolean;
}