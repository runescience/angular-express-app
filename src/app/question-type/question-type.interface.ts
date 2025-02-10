
export interface QuestionType {
  question_type_id: string;
  type: string;
  is_active: boolean;
  has_regex: boolean;
  regex_str?: string;
  has_options: boolean;
  options_str?: string;
  has_supplemental: boolean;
  supplemental_str?: string;
  created_on: Date;
  updated_on: Date;
  author?: string;
}