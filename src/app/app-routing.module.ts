import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EschListComponent } from './esch-list/esch-list.component';
import { SupportListComponent } from './support-list/support-list.component';
import { TeamsComponent } from './teams/teams.component';
import { QuestionTypeComponent } from './question-type/question-type.component';
import { QuestionComponent } from './question/question.component';
import { WorkflowTemplateComponent } from './workflow-template/workflow-template.component';
import { SelectWorkflowComponent } from './select-workflow/select-workflow.component';
import { RolesComponent } from './role/role.component';
import { UserComponent } from './user/user.component';
import { StagesComponent } from './stages/stages.component';
import { OptionListsComponent } from './option-lists/option-lists.component';

import { LoginComponent } from './login/login.component';
import { NotificationsComponent } from './notifications/notifications.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'esch-list', component: EschListComponent },
  { path: 'support-list', component: SupportListComponent },
  { path: 'teams', component: TeamsComponent },
  { path: 'question-type', component: QuestionTypeComponent },
  { path: 'question', component: QuestionComponent },
  { path: 'workflow-template', component: WorkflowTemplateComponent },
  { path: 'select-workflow', component: SelectWorkflowComponent },
  { path: 'option-lists', component: OptionListsComponent },
  { path: 'role', component: RolesComponent },
  { path: 'user', component: UserComponent },
  { path: 'stages', component: StagesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
