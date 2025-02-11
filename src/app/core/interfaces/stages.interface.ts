import { v4 as uuidv4 } from 'uuid';

export interface ApprovalStage {
    stage_id: string;
    stage_name: string;
    next_stage_name?: string;
    last_stage_name?: string;
    created_on: Date;
    modified_on: Date;
    author: string;
    modified_by?: string;
    is_first: boolean;
    is_last: boolean;
    order: number;
    conditions?: string;
    workflow_template_id?: string;
    approve_role_id?: string;
    deny_role_id?: string;
}
