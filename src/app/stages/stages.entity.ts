// src/app/stages/stages.entity.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('approval_stages')
export class ApprovalStage {
    @PrimaryColumn('varchar', { length: 8 })
    stage_id: string = uuidv4().substring(0, 8); // UUID-4 for stage_id

    @Column({ length: 100, nullable: false })
    stage_name!: string;

    @Column({ length: 100, nullable: true })
    next_stage_name?: string;

    @Column({ length: 100, nullable: true })
    last_stage_name?: string;

    @CreateDateColumn()
    created_on: Date = new Date();

    @UpdateDateColumn()
    modified_on: Date = new Date();

    @Column({ length: 100, nullable: false })
    author!: string;

    @Column({ length: 100, nullable: true })
    modified_by?: string;

    @Column({ default: false })
    is_first!: boolean;

    @Column({ default: false })
    is_last!: boolean;

    @Column()
    order!: number; // Sequence order of the stage in the process

    @Column({ nullable: true })
    conditions?: string; // Optional conditions under which transitions occur

    @Column({ nullable: true })
    workflow_template_id?: string; // ForeignKey to workflow_templates.id

    @Column({ nullable: true })
    approve_role_id?: string; // ForeignKey to role.role_id

    @Column({ nullable: true })
    deny_role_id?: string; // ForeignKey to role.role_id

    constructor(data: Partial<ApprovalStage>) {
        Object.assign(this, data);
    }

    @BeforeInsert()
    generateId() {
        this.stage_id = uuidv4().substring(0, 8);
    }
}