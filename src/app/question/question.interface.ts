
export interface Question {
  question_id: string;
  question_text: string;
  question_help: string | null;
  question_type_id: string;
  created_on: Date;
  updated_on: Date;
  author: string;
  is_active: boolean;
}
