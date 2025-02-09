
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from './question.interface';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'http://localhost:3000/api/questions';

  constructor(private http: HttpClient) { }

  getAllQuestions(): Observable<Question[]> {
    console.log('Fetching getAllQuestions from:', this.apiUrl);
    const result = this.http.get<Question[]>(this.apiUrl);

    result.subscribe({
      next: (data: Question[]) => {
        console.log('%c Question Data:', 'background: #222; color: #bada55', data);
        console.table(data); // This will show the data in a table format
      },
      error: (error: any) => {
        console.error('Error retrieving questions:', error);
      }
    });

    return result;
  }

  getQuestion(id: string): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/${id}`);
  }

  createQuestion(question: Partial<Question>): Observable<Question> {
    return this.http.post<Question>(this.apiUrl, question);
  }

  updateQuestion(id: string, question: Partial<Question>): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/${id}`, question);
  }

  deleteQuestion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
