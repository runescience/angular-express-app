import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router'; // Add this import
import { RolesService } from './role/roles.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EschListComponent } from './esch-list/esch-list.component';
import { SupportListComponent } from './support-list/support-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TeamsComponent } from './teams/teams.component';
import { QuestionTypeComponent } from './question-type/question-type.component';
import { QuestionComponent } from './question/question.component';
import { WorkflowTemplateComponent } from './workflow-template/workflow-template.component';
import { SelectWorkflowComponent } from './select-workflow/select-workflow.component';
import { RolesComponent } from './role/role.component';
import { UserComponent } from './user/user.component';
import { StagesComponent } from './stages/stages.component';
import { OptionListsComponent } from './option-lists/option-lists.component';
import { SelectWorkflowsComponent } from './select-workflows/select-workflows.component';
import { LoginComponent } from './login/login.component';
import { NotificationsComponent } from './notifications/notifications.component';

import { Team } from './teams/team.entity';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    EschListComponent,
    SupportListComponent,
    DashboardComponent,
    TeamsComponent,
    QuestionTypeComponent,
    QuestionComponent,
    WorkflowTemplateComponent,
    SelectWorkflowComponent,
    RolesComponent,
    UserComponent,
    StagesComponent,
    OptionListsComponent,
    SelectWorkflowsComponent,
    LoginComponent,
    NotificationsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserModule,

    RouterModule,
    AppRoutingModule,
    ReactiveFormsModule

  ],
  providers: [RolesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
