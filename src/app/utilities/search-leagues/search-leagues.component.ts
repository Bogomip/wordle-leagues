import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService, User } from 'src/app/services/authentication.service';
import { LeagueService } from 'src/app/services/league.service';

@Component({
  selector: 'app-search-leagues',
  templateUrl: './search-leagues.component.html',
  styleUrls: ['./search-leagues.component.scss']
})
export class SearchLeaguesComponent implements OnInit {

    isSearching: boolean = false;
    errorMessage: string = '';
    foundLeague: {code: string, name: string, members: number};

    user: User;

    constructor(
        private http: HttpClient,
        private auth: AuthenticationService,
        private leagueService: LeagueService
    ) { }

    ngOnInit(): void {
        this.auth.user.subscribe((user: User) => this.user = user);
    }

    searchLeagues(): void {
        const leagueId: string = (document.getElementById('league-code') as HTMLInputElement).value;
        this.isSearching = true;
        // find the league stuff
        this.http.get<{success: boolean, data: {code: string, name: string, members: number}}>(`http://localhost:3000/api/league/search/leagueId=${leagueId}`).subscribe({
            next: (league: {success: boolean, data: {code: string, name: string, members: number}}) => {
                this.foundLeague = {code: league.data.code, name: league.data.name, members: league.data.members};
                this.isSearching = false;
            }, error: (error: any) => {
                console.log(`Search error: The league was likely not found....`)
                this.errorMessage = `The league with id ${leagueId} was not found...`;
                this.isSearching = false;
            }
        })
    }

    resetSearch(): void {
        this.foundLeague = null!;
    }

    /**
     * Joins the league and updates the leagues thing...
     */
    joinLeague(): void {
        this.leagueService.joinLeague(this.user._id, this.foundLeague.code).subscribe({
            next: (result: any) => {
                // success - refresh the leagues information...
                this.leagueService.getLeaguesData(this.user._id);
        },  error: (error: any) => {
                // failure
                this.errorMessage = `Unable to join league: ${error}`;
        }})
    }

}
