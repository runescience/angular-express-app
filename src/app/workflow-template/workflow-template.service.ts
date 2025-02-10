import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkflowTemplate } from './workflow-template.entity';

@Injectable({
  providedIn: 'root',
})
export class WorkflowTemplateService {
  private apiUrl = '/api/workflow-templates'; // Adjust the URL according to your API structure

  constructor(private http: HttpClient) {}

  // Fetch all workflow templates
  getAllTemplates(): Observable<WorkflowTemplate[]> {
    return this.http.get<WorkflowTemplate[]>(this.apiUrl);
  }

  // Fetch a specific workflow template by ID
  getTemplateById(id: string): Observable<WorkflowTemplate> {
    return this.http.get<WorkflowTemplate>(`${this.apiUrl}/${id}`);
  }

  // Create a new workflow template
  createTemplate(template: WorkflowTemplate): Observable<WorkflowTemplate> {
    return this.http.post<WorkflowTemplate>(this.apiUrl, template);
  }

  // Update an existing workflow template
  updateTemplate(template: WorkflowTemplate): Observable<WorkflowTemplate> {
    return this.http.put<WorkflowTemplate>(`${this.apiUrl}/${template.id}`, template);
  }

  // Delete a workflow template by ID
  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
