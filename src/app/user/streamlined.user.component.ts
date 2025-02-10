import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { User } from './user.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role } from './role.interface';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
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
    this.initForm();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/),
        ],
      ],
      is_active: [true],
      roles: [[]],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load users';
        console.error('Error loading users:', error);
      },
    });
  }

  loadRoles(): void {
    this.userService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      },
    });
  }

  openModal(user?: User): void {
    this.errorMessage = '';
    this.isModalOpen = true;
    this.isEditing = !!user;
    this.currentUserId = user?.user_id || null;

    if (user) {
      // Edit mode
      const roleIds = user.roles?.map((role) => role.role_id) || [];
      this.userForm.patchValue({
        username: user.username,
        email: user.email,
        is_active: user.is_active,
        roles: roleIds,
      });
      // Remove password requirement in edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      // Create mode
      this.initForm(); // Reset to fresh form with all validators
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.errorMessage = '';
    this.userForm.reset({ is_active: true, roles: [] });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    const userData = {
      ...this.userForm.value,
      roles: this.userForm.value.roles || [],
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
        if (error.error?.includes('UNIQUE constraint')) {
          this.errorMessage = 'Email address is already in use';
        } else {
          this.errorMessage = 'Failed to save user';
        }
        console.error('Error saving user:', error);
      },
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete user';
          console.error('Error deleting user:', error);
        },
      });
    }
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return `${fieldName} is required`;
      if (control.errors['email']) return 'Invalid email format';
      if (control.errors['minlength']) return `${fieldName} is too short`;
      if (control.errors['maxlength']) return `${fieldName} is too long`;
      if (control.errors['pattern'])
        return 'Password must contain letters and numbers';
    }
    return '';
  }
}
