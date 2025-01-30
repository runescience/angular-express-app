import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EschListComponent } from './esch-list/esch-list.component';
import { SupportListComponent } from './support-list/support-list.component';

const routes: Routes = [
  { path: 'esch-list', component: EschListComponent },
  { path: 'support-list', component: SupportListComponent },
  { path: '', redirectTo: '/esch-list', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
