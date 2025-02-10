// src/app/teams/team.entity.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('teams')
export class Team {
  @PrimaryColumn('varchar', { length: 8 })
  id: string = uuidv4().substring(0, 8);

  @Column()
  teamName!: string;

  @Column()
  author!: string;

  @CreateDateColumn()
  created_on: Date = new Date();

  @UpdateDateColumn()
  updated_on: Date = new Date();

  @Column({ default: true })
  is_active!: boolean;
}
