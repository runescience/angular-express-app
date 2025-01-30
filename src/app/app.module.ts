import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EschListComponent } from './esch-list/esch-list.component';
import { SupportListComponent } from './support-list/support-list.component';

@NgModule({
  declarations: [
    AppComponent,
    EschListComponent,
    SupportListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
