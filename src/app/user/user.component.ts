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
    console.log("resetForm()")
    return this.userForm.controls;
  }

  // Reset form and validation states
  resetForm() {
    console.log("resetForm()")
    this.submitted = false;
    this.userForm.reset({
      is_active: true,
      roles: []
    });
  }

  // Helper methods to check validation states
  isFieldInvalid(fieldName: string): boolean {
    console.log("resetForm()")
    const field = this.userForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched || this.submitted)) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    console.log("getErrorMessage(" + fieldName)
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
    console.log("ngOnInit()")
    this.loadUsers();
    this.loadRoles();

  }

  loadUsers(): void {
    console.log("loadUsers()")
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('\n====> All Users:', users);
        
        users.forEach(user => {
          
          console.log('rUser ID:', user.user_id, '  rUsername:', user.username,'  rRoles:', user.roles, '\n------------');
          
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

  //do I need this???
  updateUserRoles(userId: string, roleIds: string[]): void {
    console.log("updateUserRoles()")
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
    console.log("openModal()")
    this.errorMessage = ''; // Clear previous errors
    try {
      this.isModalOpen = true;
      this.isEditing = !!user;

      console.log("open modal, user =", user)

      if (user) {
        console.log('1. Original user:', user);
        this.currentUserId = user.user_id;

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
    // console.log("compareRoles()")
    return role1 === role2;
  }

  isRoleSelected(roleId: string): boolean {
    const selectedRoles = this.userForm.get('roles')?.value || [];
    return selectedRoles.includes(roleId);
  }



  closeModal(): void {
    console.log("closeModal()")
    this.errorMessage = ''; // Clear errors
    this.isModalOpen = false;
    this.userForm.reset();
  }

  onSubmit(): void {
    console.log("onSubmit()")
    this.submitted = true;

    if (this.userForm.valid) {
      console.log("onSubmit():userForm.Valid=true")
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

      console.log('11) User Data being sent:', userData);
      console.log('12)Current User ID:', this.currentUserId)
      console.log('13) Is Editing:', this.isEditing)


      if (this.isEditing && this.currentUserId) {
        console.log("(this.isEditing && this.currentUserId)")
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
    console.log("onRoleChange()")
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
