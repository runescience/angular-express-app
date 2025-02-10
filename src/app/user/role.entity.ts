// src/app/user/role.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    role_id!: string;

    @Column({ length: 100, unique: true })
    role_name!: string;

    @Column({ length: 255, nullable: true })
    description!: string;

    @ManyToMany(() => User, user => user.roles)
    users!: User[];
}
