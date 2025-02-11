import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('workflow_templates')
export class WorkflowTemplate {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 255, nullable: false })
    title!: string;

    @Column({ nullable: false })
    role_ids!: string; // Store as a comma-separated string

    @Column({ nullable: false })
    question_ids!: string; // Store as a comma-separated string

    @CreateDateColumn()
    created_on!: Date;

    @UpdateDateColumn()
    updated_on!: Date;

    @Column({ nullable: false })
    author!: string;

    // Optional: Override the toString method for easier debugging/logging
    toString(): string {
        return `WorkflowTemplate ID: ${this.id}, Title: ${this.title}, Role IDs: ${this.role_ids}, Question IDs: ${this.question_ids}, Author: ${this.author}`;
    }
}