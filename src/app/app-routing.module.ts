import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CreateComponent } from './leagues/create/create.component';
import { LeaguesComponent } from './leagues/leagues.component';
import { AddResultsComponent } from './user/add-results/add-results.component';
import { JoinFromCodeComponent } from './utilities/join-from-code/join-from-code.component';
import { LoginComponent } from './utilities/login/login.component';
import { MenuComponent } from './utilities/menu/menu.component';
import { MessagesComponent } from './utilities/messages/messages.component';
import { NotfoundComponent } from './utilities/notfound/notfound.component';
import { RulesComponent } from './utilities/rules/rules.component';
import { SignupComponent } from './utilities/signup/signup.component';

const titlePrefix: string = 'Wordle League'

const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch:'full', data: { title: `${titlePrefix}`} },
    { path: 'leagues', component: LeaguesComponent, data: { title: `${titlePrefix} - Leagues`}},
    { path: 'signup', component: SignupComponent, data: { title: `${titlePrefix} - Register`}},
    { path: 'login', component: LoginComponent, data: { title: `${titlePrefix} - Login`}},
    { path: 'rules', component: RulesComponent, data: { title: `${titlePrefix} - How to Play`}},
    { path: 'messages', component: MessagesComponent, data: { title: `${titlePrefix} - Messages`}},
    { path: 'joinleague/:id', component: JoinFromCodeComponent, data: { title: `${titlePrefix} - Joining League...`}},
    { path: '**', component: NotfoundComponent, data: { title: `${titlePrefix} - Nope, not found!`}}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
