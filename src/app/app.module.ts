import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './utilities/menu/menu.component';
import { LeaguesComponent } from './leagues/leagues.component';
import { SignupComponent } from './utilities/signup/signup.component';
import { LoginComponent } from './utilities/login/login.component';
import { RulesComponent } from './utilities/rules/rules.component';
import { CreateComponent } from './leagues/create/create.component';
import { NotfoundComponent } from './utilities/notfound/notfound.component';
import { AddResultsComponent } from './user/add-results/add-results.component';
import { NotificationsComponent } from './utilities/notifications/notifications.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SpinnerComponent } from './utilities/spinner/spinner.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { SearchLeaguesComponent } from './utilities/search-leagues/search-leagues.component';
import { JoinFromCodeComponent } from './utilities/join-from-code/join-from-code.component';
import { MessagesComponent } from './utilities/messages/messages.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    LeaguesComponent,
    SignupComponent,
    LoginComponent,
    RulesComponent,
    CreateComponent,
    NotfoundComponent,
    AddResultsComponent,
    NotificationsComponent,
    SpinnerComponent,
    SearchLeaguesComponent,
    JoinFromCodeComponent,
    MessagesComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
      Title,
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
