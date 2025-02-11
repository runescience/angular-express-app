
import { Question } from '../core/interfaces/question.interface'

// question.types.ts
export interface QuestionWithType extends Question {
    questionTypeName?: string;
}
