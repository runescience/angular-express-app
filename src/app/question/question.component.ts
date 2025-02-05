
import { Component, OnInit } from '@angular/core';
import { QuestionService } from './question.service';
import { Question } from './question.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {
  questionForm: FormGroup;
  questions: Question[] = [];
  isEditing = false;
  isModalOpen = false;
  currentQuestionId: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private questionService: QuestionService,
    private fb: FormBuilder
  ) {
    this.questionForm = this.fb.group({
      question_text: ['', Validators.required],
      question_help: [''],
      question_type_id: ['', Validators.required],
      author: ['', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadQuestions();
  }

  loadQuestions() {
    this.loading = true;
    this.error = null;
    this.questionService.getAllQuestions()
      .subscribe({
        next: (questions) => {
          this.questions = questions;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'load');
        }
      });
  }

  onSubmit() {
    if (this.questionForm.valid) {
      this.loading = true;
      this.error = null;

      if (this.isEditing && this.currentQuestionId) {
        this.questionService.updateQuestion(this.currentQuestionId, this.questionForm.value)
          .subscribe({
            next: () => {
              this.loadQuestions();
              this.resetForm();
              this.loading = false;
              this.closeModal();
            },
            error: (error: HttpErrorResponse) => {
              this.handleError(error, 'update');
            }
          });
      } else {
        this.questionService.createQuestion(this.questionForm.value)
          .subscribe({
            next: () => {
              this.loadQuestions();
              this.resetForm();
              this.loading = false;
              this.closeModal();
            },
            error: (error: HttpErrorResponse) => {
              this.handleError(error, 'create');
            }
          });
      }
    }
  }

  editQuestion(question: Question) {
    this.isEditing = true;
    this.currentQuestionId = question.question_id;
    this.questionForm.patchValue(question);
    this.openModal();
  }

  deleteQuestion(id: string) {
    if (confirm('Are you sure you want to delete this question?')) {
      this.loading = true;
      this.error = null;
      this.questionService.deleteQuestion(id)
        .subscribe({
          next: () => {
            this.loadQuestions();
            this.loading = false;
          },
          error: (error: HttpErrorResponse) => {
            this.handleError(error, 'delete');
          }
        });
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.isEditing = false;
    this.currentQuestionId = null;
    this.questionForm.reset();
    this.questionForm.patchValue({
      is_active: true
    });
  }

  private handleError(error: HttpErrorResponse, operation: 'create' | 'update' | 'delete' | 'load') {
    console.error(`Error during ${operation} operation:`, error);
    this.loading = false;
    
    if (error.error instanceof ErrorEvent) {
      this.error = `Client Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          this.error = `Invalid data submitted. Please check your input.`;
          break;
        case 401:
          this.error = `Unauthorized. Please log in again.`;
          break;
        case 403:
          this.error = `You don't have permission to perform this action.`;
          break;
        case 404:
          this.error = `The requested resource was not found.`;
          break;
        case 500:
          this.error = `Server error. Please try again later.`;
          break;
        case 0:
          this.error = `Unable to connect to the server. Please check your internet connection.`;
          break;
        default:
          this.error = `Server Error: ${error.status} - ${error.statusText}`;
      }
    }
  }
}
