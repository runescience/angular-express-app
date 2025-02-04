import { Component, OnInit } from '@angular/core';
import { TeamsService } from './teams.service';
import { Team } from './team.entity';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.css'
})

export class TeamsComponent implements OnInit {

  teamForm: FormGroup;
  teams: Team[] = [];
  isEditing = false;
  isModalOpen = false;

  currentTeamId: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private teamsService: TeamsService,
    private fb: FormBuilder
  ) {
    this.teamForm = this.fb.group({
      teamName: ['', Validators.required],
      author: ['', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.loading = true;
    this.error = null;
    console.log('Loading teams...');

    this.teamsService.getAllTeams()
      .subscribe({
        next: (teams) => {
          console.log('Teams loaded successfully:', teams);
          this.teams = teams;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'create');
        }
      });
  }

  onSubmit() {
    if (this.teamForm.valid) {
      this.loading = true;
      this.error = null;

      console.log('Form Values:', this.teamForm.value);

      if (this.isEditing && this.currentTeamId) {
        this.teamsService.updateTeam(this.currentTeamId, this.teamForm.value)
          .subscribe({
            next: (response) => {
              console.log('Update successful:', response);
              this.loadTeams();
              this.resetForm();
              this.loading = false;
              this.closeModal();  // Close modal after successful update
            },
            error: (error: HttpErrorResponse) => {
              this.handleError(error, 'update');
            }
          });
      } else {
        console.log('Attempting to create team...');
        this.teamsService.createTeam(this.teamForm.value)
          .subscribe({
            next: (response) => {
              console.log('Create successful:', response);
              this.loadTeams();
              this.resetForm();
              this.loading = false;
              this.closeModal();  // Close modal after successful creation
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


  // Add this helper method to handle errors
  private handleError(error: HttpErrorResponse, operation: 'create' | 'update' | 'delete') {
    console.error(`Error during ${operation} operation:`, error);

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      this.error = `Client Error: ${error.error.message}`;
      console.error('Client-side error:', error.error.message);
    } else {
      // Backend error
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was:`, error.error);

      this.error = `Server Error: ${error.status} - ${error.statusText}`;

      // Add more specific error messages based on status codes
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
      }
    }
    this.loading = false;
  }

  editTeam(team: Team) {
    this.isEditing = true;
    this.currentTeamId = team.id;  // Set the currentTeamId
    this.teamForm.patchValue(team);
    this.openModal();
  }

  deleteTeam(id: string) {
    if (confirm('Are you sure you want to delete this team?')) {
      this.loading = true;
      this.error = null;
      this.teamsService.deleteTeam(id)
        .subscribe({
          next: () => {
            this.loadTeams();
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Failed to delete team';
            this.loading = false;
            console.error('Error deleting team:', error);
          }
        });
    }
  }


  resetForm() {
    this.isEditing = false;
    this.currentTeamId = null;  // Reset the currentTeamId
    this.teamForm.reset();
    this.teamForm.patchValue({
      is_active: true
    });
  }

}