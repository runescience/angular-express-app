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
    this.userService.getUsers().subscribe(
      (users) => {
        this.users = users;
        console.log('All Users:', users);
      },
      (error) => console.error('Error loading users:', error),
    );
  }

  loadRoles(): void {
    this.userService.getAllRoles().subscribe(
      (roles) => (this.roles = roles),
      (error) => console.error('Error loading roles:', error),
    );
  }

  openModal(user?: User): void {
    this.errorMessage = '';
    this.isModalOpen = true;
    this.isEditing = !!user;
    this.currentUserId = user ? user.user_id : null;

    if (user) {
      this.userForm.patchValue({
        username: user.username,
        email: user.email,
        is_active: user.is_active,
        roles: user.roles ? user.roles.map((role) => role.role_id) : [],
      });
      this.userForm.get('password')?.clearValidators();
    } else {
      this.userForm.reset({ is_active: true, roles: [] });
    }
    this.userForm.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    const userData = { ...this.userForm.value, user_id: this.currentUserId };
    const request$ = this.isEditing
      ? this.userService.updateUser(this.currentUserId!, userData)
      : this.userService.createUser(userData);

    request$.subscribe(
      () => {
        this.loadUsers();
        this.isModalOpen = false;
      },
      (error) => (this.errorMessage = 'Error saving user: ' + error),
    );
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required'])
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      if (control.errors['email']) return 'Please enter a valid email address';
      if (control.errors['minlength'])
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['maxlength'])
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
      if (control.errors['pattern'])
        return 'Password must contain at least one letter and one number';
    }
    return '';
  }
}
