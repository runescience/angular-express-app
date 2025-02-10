import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApprovalStage } from './stages.interface';

@Injectable({
    providedIn: 'root'
})
export class StagesService {
    private apiUrl = '/api/approval-stages';

    constructor(private http: HttpClient) {}

    getStages(): Observable<ApprovalStage[]> {
        return this.http.get<ApprovalStage[]>(this.apiUrl);
    }

    getStage(id: string): Observable<ApprovalStage> {
        return this.http.get<ApprovalStage>(`${this.apiUrl}/${id}`);
    }

    createStage(stage: Partial<ApprovalStage>): Observable<ApprovalStage> {
        return this.http.post<ApprovalStage>(this.apiUrl, stage);
    }

    updateStage(id: string, stage: Partial<ApprovalStage>): Observable<ApprovalStage> {
        return this.http.put<ApprovalStage>(`${this.apiUrl}/${id}`, stage);
    }

    deleteStage(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
