export interface WorkflowTemplate {
    id: string;                      // Unique identifier for the workflow template
    title: string;                   // Title of the workflow template
    role_ids: string;                // Comma-separated string of role IDs
    question_ids: string;            // Comma-separated string of question IDs
    created_on: Date;                // Date when the workflow template was created
    updated_on: Date;                // Date when the workflow template was last updated
    author: string;                  // Author of the workflow template
}