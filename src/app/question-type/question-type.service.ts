
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuestionType } from './question-type.interface';

@Injectable({
  providedIn: 'root'
})
export class QuestionTypeService {
  private apiUrl = '/api/question-types';

  constructor(private http: HttpClient) { }

  getAllQuestionTypes(): Observable<QuestionType[]> {
    return this.http.get<QuestionType[]>(this.apiUrl);
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
