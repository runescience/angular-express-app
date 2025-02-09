import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';


import { QuestionTypeService } from '../question-type/question-type.service';
import { QuestionService } from './question.service';
import { QuestionType } from '../question-type/question-type.interface'; // Import the interface
import { Question } from './question.interface';

import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { QuestionWithType } from './question.types';

@Component({
  standalone: false,
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {
  questions: QuestionWithType[] = [];
  questionTypes: QuestionType[] = [];
  questionForm: FormGroup;

  isEditing = false;
  isModalOpen = false;
  currentQuestionId: string | null = null;
  loading = false;
  error: string | null = null;
  constructor(

    private questionService: QuestionService,
    private questionTypeService: QuestionTypeService, // Add this line
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

    this.loadQuestionsAndTypes();

  }

  loadQuestionsAndTypes() {
    this.loading = true;
    this.error = null;

    forkJoin({
      questions: this.questionService.getAllQuestions(),
      questionTypes: this.questionTypeService.getAllQuestionTypes()
    }).subscribe({
      next: ({ questions, questionTypes }) => {
        this.questionTypes = questionTypes;
        this.questions = questions.map(question => {
          const questionType = questionTypes.find(
            qt => qt.question_type_id === question.question_type_id
          );
          return {
            ...question,
            questionTypeName: questionType?.type || 'Unknown Type'
          };
        });
        this.loading = false;
        console.log('Questions and types loaded successfully:', this.questions);
      },
      error: (error) => {
        this.handleError(error, 'load');
        this.loading = false;
      }
    });
  }

  loadQuestionTypes() {
    this.loading = true;
    this.error = null;
    console.log('Loading question types...'); // Log start of loading
    this.questionTypeService.getAllQuestionTypes()
      .subscribe({
        next: (questionTypes) => {
          this.questionTypes = questionTypes;
          this.loading = false;

          console.log('Question types loaded successfully:', this.questionTypes); // Log success

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
              this.loadQuestionsAndTypes();
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
              this.loadQuestionsAndTypes();
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
    console.log('Editing question:', question);
    this.isEditing = true;
    this.currentQuestionId = question.question_id;
    this.questionForm.patchValue({
      question_text: question.question_text,
      question_help: question.question_help,
      question_type_id: question.question_type_id,
      author: question.author,
      is_active: question.is_active
    });
    this.openModal();
  }

  deleteQuestion(id: string) {
    if (confirm('Are you sure you want to delete this question?')) {
      this.loading = true;
      this.error = null;
      this.questionService.deleteQuestion(id)
        .subscribe({
          next: () => {
            this.loadQuestionsAndTypes();
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
