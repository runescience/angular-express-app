// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-user',
//   standalone: false,

//   templateUrl: './user.component.html',
//   styleUrl: './user.component.css'
// })
// export class UserComponent {

// }

import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { User } from './user.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role } from './role.interface';


@Component({
  standalone: false,
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  submitted = false;
  selectedUser: any = null;
  errorMessage: string = '';

  userForm: FormGroup;
  isModalOpen = false;
  isEditing = false;
  currentUserId: string | null = null;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.userForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/) // At least one letter and one number
      ]],
      is_active: [true],
      roles: [[],]
    });
  }

  // Getter for easy access to form fields in the template
  get f() {
    return this.userForm.controls;
  }

  // Reset form and validation states
  resetForm() {
    this.submitted = false;
    this.userForm.reset({
      is_active: true,
      roles: []
    });
  }

  // Helper methods to check validation states
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched || this.submitted)) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control && control.errors) {
      if (control.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
      }
      if (control.errors['pattern']) {
        return 'Password must contain at least one letter and one number';
      }
    }
    return '';
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();

  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('\n====> All Users:', users);
        users.forEach(user => {
          console.log('User ID:', user.user_id);
          console.log('Username:', user.username);
          console.log('Roles:', user.roles);
          console.log('------------------------');
        });
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }



  loadRoles(): void {
    this.userService.getAllRoles().subscribe(
      roles => this.roles = roles
    );
  }

  //do I need this???
  updateUserRoles(userId: string, roleIds: string[]): void {
    this.userService.updateUserRoles(userId, roleIds).subscribe(
      () => {
        this.loadUsers();
      },
      error => {
        console.error('Error updating user roles:', error);
      }
    );
  }
  openModal(user?: User): void {
    this.errorMessage = ''; // Clear previous errors
    try {
      this.isModalOpen = true;
      this.isEditing = !!user;

      if (user) {
        console.log('1. Original user:', user);

        // Check if roles exist before trying to map them
        if (user.roles) {
          console.log('2. Original user roles:', user.roles);
          const mappedRoles = user.roles.map((role: any) => role.role_id);
          console.log('3. Mapped role_ids:', mappedRoles);

          this.userForm.patchValue({
            username: user.username,
            email: user.email,
            is_active: user.is_active,
            roles: mappedRoles
          });
        } else {
          console.log('Warning: User has no roles defined');
          this.userForm.patchValue({
            username: user.username,
            email: user.email,
            is_active: user.is_active,
            roles: [] // Set empty array if no roles
          });
        }

        // Remove password validation for editing
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();

      } else {
        // Create mode
        this.currentUserId = null;
        this.userForm.reset({
          is_active: true,
          roles: []
        });
      }

      console.log('4. Form after patch:', this.userForm.value);
      console.log('5. Available roles:', this.roles);

    } catch (error) {
      console.error('Error in openModal:', error);
      // Handle the error appropriately
    }
  }

  // Compare function for select [compareWith]
  // Update the select template to use role_id as value
  compareRoles(role1: string, role2: string): boolean {
    return role1 === role2;
  }

  isRoleSelected(roleId: string): boolean {
    const selectedRoles = this.userForm.get('roles')?.value || [];
    return selectedRoles.includes(roleId);
  }



  closeModal(): void {
    this.errorMessage = ''; // Clear errors
    this.isModalOpen = false;
    this.userForm.reset();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      console.log('Form Value:', formValue);

      // Define the type to include optional password
      const userData: {
        username: string;
        email: string;
        is_active: boolean;
        roles: string[];
        password?: string;  // Make password optional
      } = {
        username: formValue.username,
        email: formValue.email,
        is_active: formValue.is_active || true,
        roles: Array.isArray(formValue.roles) ? formValue.roles : [],
        password: formValue.password
      };

      console.log('User Data being sent:', userData);

      if (this.isEditing && this.currentUserId) {
        // Don't send password for updates
        delete userData.password;
        this.userService.updateUser(this.currentUserId, userData)
          .subscribe({
            next: () => {
              this.loadUsers();
              this.closeModal();
            },
            error: (error) => {
              if (error.error?.error?.includes('UNIQUE constraint')) {
                this.errorMessage = 'This email address is already being used by another user. Please choose a different email.';
              } else {
                this.errorMessage = 'An error occurred while updating the user.';
              }
              console.error('Update error:', error);
            }
          });
      } else {
        // For new users, password is required
        if (!userData.password) {
          console.error('Password is required for new users');
          return;
        }
        this.userService.createUser(userData)
          .subscribe({
            next: () => {
              this.loadUsers();
              this.closeModal();
            },
            error: (error) => {
              if (error.error?.error?.includes('UNIQUE constraint')) {
                this.errorMessage = 'This email address is already being used by another user. Please choose a different email.';
              } else {
                this.errorMessage = 'An error occurred while creating the user.';
              }
              console.error('Create error:', error);
            }
          });
      }
    } else {
      console.log('Form is invalid:', this.userForm.errors);
    }
  }


  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  hasRole(user: User, roleId: string): boolean {
    // Check if user and roles exist before accessing
    if (!user || !user.roles) {
      return false;
    }

    return user.roles.some(role => role.role_id === roleId);
  }


  onRoleChange(event: any, roleId: string): void {
    const rolesFormControl = this.userForm.get('roles');
    const currentRoles = new Set(rolesFormControl?.value || []);

    if (event.target.checked) {
      currentRoles.add(roleId);
    } else {
      currentRoles.delete(roleId);
    }

    rolesFormControl?.setValue(Array.from(currentRoles));
  }

}
