import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from './user.service';
//src/app/user/
//src/app/core/interfaces
// Import interfaces
import { User } from '../core/interfaces/user.interface';
import { Role } from '../core/interfaces/role.interface';

// // Import entities
// import { UserEntity } from '../core/entities/user.entity';
// import { RoleEntity } from '../core/entities/role.entity';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  standalone: false
})
export class UserComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  userForm: FormGroup;
  isModalOpen = false;
  isEditing = false;
  currentUserId: string | null = null;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
  ) {
    this.userForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      username: ['', {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50)
        ],
        updateOn: 'blur'
      }],
      email: ['', {
        validators: [
          Validators.required,
          Validators.email,
          Validators.maxLength(100)
        ],
        updateOn: 'blur'
      }],
      password: ['', {
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
        ]
      }],
      is_active: [true],
      roles: [[]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();

    // Subscribe to form value changes to debug
    this.userForm.statusChanges.subscribe(status => {
      console.log('Form Status:', status);
      console.log('Form Errors:', this.userForm.errors);
      console.log('Form Valid:', this.userForm.valid);
      console.log('Form Values:', this.userForm.value);
    });
  }


  public deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          // Handle successful deletion
          // For example, refresh the user list
          this.loadUsers(); // Assuming you have a method to reload users
        },
        error: (error) => {
          // Handle error
          console.error('Error deleting user:', error);
          this.errorMessage = 'Failed to delete user';
        }
      });
    }
  }

  loadUsers(): void {
    console.log("loadUsers()")
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('\n====> All Users:', users);

        users.forEach(user => {

          console.log('rUser ID:', user.user_id, '  rUsername:', user.username, '  rRoles:', user.roles, '\n------------');

        });
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }

  loadRoles(): void {
    console.log("user.components.ts: loadRoles()")

    this.userService.getAllRoles().subscribe(
      roles => this.roles = roles
    );
  }


  openModal(user?: User): void {
    this.errorMessage = '';
    this.isModalOpen = true;
    this.isEditing = !!user;
    this.currentUserId = user?.user_id || null;

    if (user) {
      const roleIds = user.roles?.map(role => role.role_id) || [];
      this.userForm.patchValue({
        username: user.username,
        email: user.email,
        is_active: user.is_active,
        roles: roleIds
      });

      // Remove password validation in edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      // Reset form for create mode
      this.userForm.reset();
      this.userForm = this.createForm(); // Recreate form with all validators
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.errorMessage = '';
    this.userForm.reset();
    this.isEditing = false;
    this.currentUserId = null;
  }
  // Add this method to fix the error
  public isFormValid(): boolean {
    if (!this.userForm) return false;

    if (this.isEditing) {
      return this.userForm.valid && this.userForm.dirty;
    } else {
      // In create mode, all fields should be valid
      return this.userForm.valid;
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    const userData = {
      ...this.userForm.value,
      roles: this.userForm.value.roles || []
    };

    const operation = this.isEditing
      ? this.userService.updateUser(this.currentUserId!, userData)
      : this.userService.createUser(userData);

    operation.subscribe({
      next: () => {
        this.loadUsers();
        this.closeModal();
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  // Helper method to mark all fields as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private handleError(error: any): void {
    if (error.error?.includes('UNIQUE constraint')) {
      this.errorMessage = 'Email address is already in use';
    } else {
      this.errorMessage = 'Failed to save user';
    }
    console.error('Error saving user:', error);
  }

  // Improved validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return `${fieldName} is required`;
    if (errors['email']) return 'Invalid email format';
    if (errors['minlength']) {
      return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `${fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['pattern']) return 'Password must contain both letters and numbers';

    return '';
  }


}
