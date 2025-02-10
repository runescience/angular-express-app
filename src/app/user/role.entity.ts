// src/app/user/role.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany,CreateDateColumn, UpdateDateColumn  } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    role_id!: string;

    @Column({ length: 100, unique: true })
    role_name!: string;

    @Column({ length: 255, nullable: true })
    description!: string;

    @CreateDateColumn()
    created_on: Date = new Date();

    @UpdateDateColumn()
    updated_on: Date = new Date();

    @ManyToMany(() => User, (user) => user.roles)
    users!: User[];
}
