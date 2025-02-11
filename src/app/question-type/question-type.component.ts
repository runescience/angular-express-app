
import { Component, OnInit } from '@angular/core';
import { QuestionTypeService } from './question-type.service';
import { QuestionType } from '../core/interfaces/question-type.interface'

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  standalone: false,
  selector: 'app-question-type',
  templateUrl: './question-type.component.html',
  styleUrls: ['./question-type.component.css'],


})
export class QuestionTypeComponent implements OnInit {
  questionTypeForm: FormGroup;
  questionTypes: QuestionType[] = [];
  isEditing = false;
  isModalOpen = false;
  currentQuestionTypeId: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private questionTypeService: QuestionTypeService,
    private fb: FormBuilder
  ) {
    this.questionTypeForm = this.fb.group({
      type: ['', Validators.required],
      author: ['', Validators.required],
      has_regex: [false],
      regex_str: [''],
      has_options: [false],
      options_str: [''],
      has_supplemental: [false],
      supplemental_str: [''],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadQuestionTypes();
  }

  loadQuestionTypes() {
    this.loading = true;
    this.error = null;

    this.questionTypeService.getAllQuestionTypes()
      .subscribe({
        next: (questionTypes) => {
          this.questionTypes = questionTypes;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'load');
        }
      });
  }

  onSubmit() {
    if (this.questionTypeForm.valid) {
      this.loading = true;
      this.error = null;

      if (this.isEditing && this.currentQuestionTypeId) {
        this.questionTypeService.updateQuestionType(this.currentQuestionTypeId, this.questionTypeForm.value)
          .subscribe({
            next: () => {
              this.loadQuestionTypes();
              this.resetForm();
              this.loading = false;
              this.closeModal();
            },
            error: (error: HttpErrorResponse) => {
              this.handleError(error, 'update');
            }
          });
      } else {
        this.questionTypeService.createQuestionType(this.questionTypeForm.value)
          .subscribe({
            next: () => {
              this.loadQuestionTypes();
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

  editQuestionType(questionType: QuestionType) {
    this.isEditing = true;
    this.currentQuestionTypeId = questionType.question_type_id;
    this.questionTypeForm.patchValue(questionType);
    this.openModal();
  }

  deleteQuestionType(id: string) {
    if (confirm('Are you sure you want to delete this question type?')) {
      this.loading = true;
      this.error = null;
      this.questionTypeService.deleteQuestionType(id)
        .subscribe({
          next: () => {
            this.loadQuestionTypes();
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
    this.currentQuestionTypeId = null;
    this.questionTypeForm.reset();
    this.questionTypeForm.patchValue({
      has_regex: false,
      has_options: false,
      has_supplemental: false,
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
