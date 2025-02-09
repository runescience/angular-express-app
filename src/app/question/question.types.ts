import { Question } from "./question.interface";

// question.types.ts
export interface QuestionWithType extends Question {
    questionTypeName?: string;
}
