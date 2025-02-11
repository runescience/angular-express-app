
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OptionList } from '../core/interfaces/option-list.interface'

@Injectable({
  providedIn: 'root'
})
export class OptionListsService {
  private apiUrl = 'http://localhost:3000/api/option-lists';

  constructor(private http: HttpClient) { }

  getAllOptionLists(): Observable<OptionList[]> {
    return this.http.get<OptionList[]>(this.apiUrl);
  }

  getOptionList(id: string): Observable<OptionList> {
    return this.http.get<OptionList>(`${this.apiUrl}/${id}`);
  }

  createOptionList(optionList: Partial<OptionList>): Observable<OptionList> {
    return this.http.post<OptionList>(this.apiUrl, optionList);
  }

  updateOptionList(id: string, optionList: Partial<OptionList>): Observable<OptionList> {
    return this.http.put<OptionList>(`${this.apiUrl}/${id}`, optionList);
  }

  deleteOptionList(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
