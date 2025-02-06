export interface QuestionType {
  question_type_id: string;
  type: string;
  is_active: boolean;
  has_regex: boolean;
  regex_str: string | null;
  has_options: boolean;
  options_str: string | null;
  has_supplemental: boolean;
  supplemental_str: string | null;
  created_at: Date;
  updated_at: Date;
  author: string;
}
