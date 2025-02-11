
import { Component, OnInit } from '@angular/core';
import { OptionListsService } from './option-lists.service';

import { OptionList } from '../core/interfaces/option-list.interface'

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-option-lists',
  templateUrl: './option-lists.component.html',
  styleUrl: './option-lists.component.css'
})
export class OptionListsComponent implements OnInit {
  optionListForm: FormGroup;
  optionLists: OptionList[] = [];
  isEditing = false;
  isModalOpen = false;
  currentListId: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private optionListsService: OptionListsService,
    private fb: FormBuilder
  ) {
    this.optionListForm = this.fb.group({
      name: ['', Validators.required],
      list_data: ['', Validators.required],
      version: [''],
      supercedes: [''],
      author: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadOptionLists();
  }

  loadOptionLists() {
    this.loading = true;
    this.error = null;

    this.optionListsService.getAllOptionLists()
      .subscribe({
        next: (optionLists) => {
          this.optionLists = optionLists;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'load');
        }
      });
  }

  onSubmit() {
    if (this.optionListForm.valid) {
      this.loading = true;
      this.error = null;

      if (this.isEditing && this.currentListId) {
        this.optionListsService.updateOptionList(this.currentListId, this.optionListForm.value)
          .subscribe({
            next: () => {
              this.loadOptionLists();
              this.resetForm();
              this.loading = false;
              this.closeModal();
            },
            error: (error: HttpErrorResponse) => {
              this.handleError(error, 'update');
            }
          });
      } else {
        this.optionListsService.createOptionList(this.optionListForm.value)
          .subscribe({
            next: () => {
              this.loadOptionLists();
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

  editOptionList(optionList: OptionList) {
    this.isEditing = true;
    this.currentListId = optionList.id;
    this.optionListForm.patchValue(optionList);
    this.openModal();
  }

  deleteOptionList(id: string) {
    if (confirm('Are you sure you want to delete this option list?')) {
      this.loading = true;
      this.error = null;
      this.optionListsService.deleteOptionList(id)
        .subscribe({
          next: () => {
            this.loadOptionLists();
            this.loading = false;
          },
          error: (error) => {
            this.handleError(error, 'delete');
          }
        });
    }
  }

  private handleError(error: HttpErrorResponse, operation: string) {
    console.error(`Error during ${operation} operation:`, error);
    this.error = `Failed to ${operation} option list. Please try again.`;
    this.loading = false;
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
    this.currentListId = null;
    this.optionListForm.reset();
  }
}
