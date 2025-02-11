import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('roles')
export class Role {
    @PrimaryColumn('varchar')
    role_id: string = uuidv4().substring(0, 8);

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    role_name!: string;

    @Column({
        type: 'text',
        nullable: true
    })
    description!: string;

    @Column({
        type: 'text',
        nullable: true
    })
    author!: string;

    @CreateDateColumn({
        type: 'timestamp',
        nullable: false
    })
    created_on!: Date;

    @UpdateDateColumn({
        type: 'timestamp'
    })
    updated_on!: Date;

    @Column({
        type: 'boolean',
        default: true
    })
    is_active!: boolean;
}
