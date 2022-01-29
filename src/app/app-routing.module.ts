import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateComponent } from './leagues/create/create.component';
import { LeaguesComponent } from './leagues/leagues.component';
import { AddResultsComponent } from './user/add-results/add-results.component';
import { LoginComponent } from './utilities/login/login.component';
import { MenuComponent } from './utilities/menu/menu.component';
import { NotfoundComponent } from './utilities/notfound/notfound.component';
import { RulesComponent } from './utilities/rules/rules.component';
import { SignupComponent } from './utilities/signup/signup.component';

const routes: Routes = [
    { path: '', component: MenuComponent, outlet: 'left' },
    { path: '', component: RulesComponent },
    { path: 'rules', component: RulesComponent },
    { path: 'signup', component: SignupComponent, outlet: 'left' },
    { path: 'login', component: LoginComponent, outlet: 'left' },
    { path: 'create', component: CreateComponent, outlet: 'left' },
    { path: 'submit', component: AddResultsComponent, outlet: 'left' },
    { path: 'leagues', component: LeaguesComponent},
    { path: '**', component: NotfoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
