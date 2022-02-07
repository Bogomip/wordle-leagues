import { Component, OnInit } from '@angular/core';
import { AuthenticationService, User } from '../services/authentication.service';
import { League, LeagueMember, LeagueService } from '../services/league.service';

@Component({
  selector: 'app-leagues',
  templateUrl: './leagues.component.html',
  styleUrls: ['./leagues.component.scss']
})
export class LeaguesComponent implements OnInit {

    // leagues array....
    leagues: League[];

    // how much each position is worth, starting from 1st. No fail points are available.
    scoreArray: number[] = [2,3,4,3,2,1];

    // users...
    user: User;

    constructor(
        private leagueService: LeagueService,
        private auth: AuthenticationService
    ) { }

    ngOnInit(): void {
        this.auth.user.subscribe((user: User) => {
            this.user = user;
            this.leagues = this.leagueService.getLeaguesData(this.user._id);
            // sort each league by the total points...
            for(let i = 0; i < this.leagues.length; i++) {
                this.leagues[i].members = [...this.sortLeagueArray(this.leagues[i].members)];
            }
        })
    }

    /**
     * Sorts the league members into descending points order...
     * @param leagues
     * @returns
     */
    sortLeagueArray(leagues: LeagueMember[]): LeagueMember[] {
        const sortedLeagues = leagues.sort((a: LeagueMember, b: LeagueMember) => this.calculateMemberPoints(b) - this.calculateMemberPoints(a));
        return [...sortedLeagues];
    }

    /**
     *
     * @param member Calculates the total points of a member
     * @returns
     */
    calculateMemberPoints(member: LeagueMember): number {
        let totalScore = 0;
        for(const [score, value] of Object.entries(member.score)) {
            if(score !== 'fail') {
                totalScore += (this.scoreArray[+score-1] * value);
            }
        }
        return totalScore;
    }

    toggleNotifications(): void {

    }

    leaveLeague(leagueId: string): void {
        // if an admin leaves what happens?
    }

    addLeaguecodeToClipboard(leagueId: string): void {

    }

    restartLeague(leagueId: string): void {

    }

    deleteLeague(leagueId: string): void {

    }

    removeUserFromLeague(leagueId: string, userIdToDelete: string): void {

    }
}
