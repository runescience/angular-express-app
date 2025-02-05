
export interface Question {
  question_id: string;
  question_text: string;
  question_help: string | null;
  question_type_id: string;
  created_at: Date;
  updated_at: Date;
  author: string;
  is_active: boolean;
}
