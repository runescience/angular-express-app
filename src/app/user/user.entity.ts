import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, BeforeInsert, PrimaryColumn } from 'typeorm';
import { Role } from './role.entity';
import { v4 as uuidv4 } from 'uuid';  // You'll need to install uuid package if not already installed

@Entity('users')
export class User {
    @PrimaryColumn({ length: 8 })
    user_id!: string;

    @Column({ length: 100 })
    username!: string;

    @Column({ length: 100, unique: true })
    email!: string;

    @Column({ length: 128 })
    password_hash!: string;

    @Column({ default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_on!: Date;

    @UpdateDateColumn()
    updated_on!: Date;

    @ManyToMany(() => Role)
    @JoinTable({
        name: 'user_roles',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'user_id'
        },
        inverseJoinColumn: {
            name: 'role_id',
            referencedColumnName: 'role_id'
        }
    })
    roles!: Role[];

    @BeforeInsert()
    generateId() {
        this.user_id = uuidv4().substring(0, 8);
    }
}
