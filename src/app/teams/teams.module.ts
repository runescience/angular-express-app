// src/app/teams/teams.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TeamsComponent } from './teams.component';
import { TeamsService } from './teams.service';


@NgModule({
  declarations: [TeamsComponent],

imports: [
    CommonModule,
    ReactiveFormsModule  // Make sure this is imported
  ],
  exports: [TeamsComponent],
  providers: [TeamsService]
})
export class TeamsModule { }
