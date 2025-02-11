
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { QuestionType } from '../core/interfaces/question-type.interface'

@Injectable({
  providedIn: 'root'
})
export class QuestionTypeService {
  private apiUrl = 'http://localhost:3000/api/question-types';

  constructor(private http: HttpClient) { }

  getAllQuestionTypes(): Observable<QuestionType[]> {

    const result = this.http.get<QuestionType[]>(this.apiUrl);

    result.subscribe({
      next: (data: QuestionType[]) => {
        console.log('%c Question Types Data:', 'background: #222; color: #bada55', data);
        console.table(data); // This will show the data in a table format
      },
      error: (error: any) => {
        console.error('Error retrieving question types:', error);
      }
    });

    console.log('Question types retrieved:', result);

    return result;

  }

  getQuestionType(id: string): Observable<QuestionType> {
    return this.http.get<QuestionType>(`${this.apiUrl}/${id}`);
  }

  createQuestionType(questionType: Partial<QuestionType>): Observable<QuestionType> {
    return this.http.post<QuestionType>(this.apiUrl, questionType);
  }

  updateQuestionType(id: string, questionType: Partial<QuestionType>): Observable<QuestionType> {
    return this.http.put<QuestionType>(`${this.apiUrl}/${id}`, questionType);
  }

  deleteQuestionType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
