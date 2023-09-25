import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, User } from 'src/app/services/authentication.service';
import { LeagueService } from 'src/app/services/league.service';
import { Message, MessagesService } from 'src/app/services/messages.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

    leagueName: string;
    user: User;
    errorMessage: string = ''

    constructor(
        private auth: AuthenticationService,
        private http: HttpClient,
        private router: Router,
        private leagueService: LeagueService,
        private messageService: MessagesService
    ) { }

    ngOnInit(): void {
        // get user information...
        this.auth.user.subscribe((user: User) => {
            this.user = user;
        })
    }

    /**
     * Creates a new league...
     */
    createLeague(): void {
        const leagueName: string = (document.getElementById('league-name') as HTMLInputElement).value;

        if(leagueName.length >= 3 && leagueName.length <= 30) {
            this.http.post<{ message: string, data: Message[] }>(environment.apiUrl+'/api/league/create', { name: leagueName }).subscribe({
                next: (result: { message: string, data: Message[] }) => {
                    this.leagueService.getLeaguesData(this.user._id);
                    this.messageService.addMessage(result.data);
                },
                error: () => {
                    this.errorMessage = 'League could not be created, check you are correctly logged in, refresh the page, or try again later.'
                }
        })
        } else {
            this.errorMessage = 'Leagues must have a length of at least three characters and mo more than 30 characters...'
        }
    }

    /**
     * Clears any current errors...
     */
    clearError(): void {
        this.errorMessage = '';
    }

}
