export class QuestionTypeEntity {
  question_type_id: string;
  type: string;
  is_active: boolean;
  has_regex: boolean;
  regex_str?: string;
  has_options: boolean;
  options_str?: string;
  has_supplemental: boolean;
  supplemental_str?: string;
  created_at: Date;
  updated_at: Date;
  author?: string;

  constructor(data: Partial<QuestionTypeEntity>) {
    Object.assign(this, data);
  }
}