
// src/app/role/role.component.ts
import { Component, OnInit } from '@angular/core';
import { RolesService } from './roles.service';

import { Role } from '../core/interfaces/role.interface'

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-roles',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
  standalone: false
})
export class RolesComponent implements OnInit {
  roleForm: FormGroup;
  roles: Role[] = [];
  isEditing = false;
  isModalOpen = false;
  currentRoleId: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(private rolesService: RolesService, private fb: FormBuilder) {
    this.roleForm = this.fb.group({
      role_name: ['', Validators.required],
      description: [''],
      author: ['', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    console.log("role.components.ts: loadRoles()")
    this.loading = true;
    this.error = null;

    this.rolesService.getAllRoles()
      .subscribe({
        next: (roles) => {
          this.roles = roles;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'load');
        }
      });
  }

  onSubmit() {
    if (this.roleForm.valid) {
      this.loading = true;
      this.error = null;

      if (this.isEditing && this.currentRoleId) {
        this.rolesService.updateRole(this.currentRoleId, this.roleForm.value)
          .subscribe({
            next: () => {
              this.loadRoles();
              this.resetForm();
              this.loading = false;
              this.closeModal();
            },
            error: (error: HttpErrorResponse) => {
              this.handleError(error, 'update');
            }
          });
      } else {
        this.rolesService.createRole(this.roleForm.value)
          .subscribe({
            next: () => {
              this.loadRoles();
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

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  private handleError(error: HttpErrorResponse, operation: string) {
    this.loading = false;
    this.error = `Error during ${operation} operation: ${error.message}`;
  }

  editRole(role: Role) {
    this.isEditing = true;
    this.currentRoleId = role.role_id;
    this.roleForm.patchValue(role);
    this.openModal();
  }

  deleteRole(id: string) {
    if (confirm('Are you sure you want to delete this role?')) {
      this.loading = true;
      this.rolesService.deleteRole(id)
        .subscribe({
          next: () => {
            this.loadRoles();
            this.loading = false;
          },
          error: (error) => {
            this.handleError(error, 'delete');
          }
        });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.currentRoleId = null;
    this.roleForm.reset();
    this.roleForm.patchValue({ is_active: true });
  }
}