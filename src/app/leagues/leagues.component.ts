import { Component, OnInit } from '@angular/core';
import { AuthenticationService, User } from '../services/authentication.service';
import { League, LeagueMember, LeagueService } from '../services/league.service';
import { Message, MessagesService } from '../services/messages.service';

@Component({
  selector: 'app-leagues',
  templateUrl: './leagues.component.html',
  styleUrls: ['./leagues.component.scss']
})
export class LeaguesComponent implements OnInit {

    // leagues array....
    leagues: League[];
    currentlyReloadingLeagues: string[] = [];

    // how much each position is worth, starting from 1st. No fail points are available.
    scoreArray: number[] = [2,3,4,3,2,1]; // HAS TO MATCH THE DB FOR NOW.

    // errors and control booleans
    errorMessage: string = '';
    copiedToClipboard: boolean = false;
    createNewLeague: boolean = false;

    // users...
    user: User;

    constructor(
        private leagueService: LeagueService,
        private auth: AuthenticationService,
        private messageService: MessagesService
    ) { }

    ngOnInit(): void {
        // subscribe to the user, and after that is done retrieve the league data for this user...
        this.auth.user.subscribe((user: User) => {
            this.user = user;
            // force the league service to update its data once a user has been established......
            this.leagueService.getLeaguesData(user._id);
        })

        // sub to the league behaviour object
        this.leagueService.leagues.subscribe((newLeagues: League[]) => {
            if(newLeagues) {
                this.leagues = [...newLeagues];
                // sort each league by the total points and remove just updated leagues from the cucrentlyReloadsingGmes array...
                for(let i = 0; i < this.leagues.length; i++) {
                    this.leagues[i].members = [...this.sortLeagueArray(this.leagues[i].members)];
                    // remove from the updating array...
                    const reloadIndex: number = this.currentlyReloadingLeagues.findIndex((temp: string) => temp === this.leagues[i]._id);
                    // if its in there, remove it...
                    if(reloadIndex !== -1) this.currentlyReloadingLeagues.splice(reloadIndex, 1);
                }
            }
        })

        // subscribe to the subject which will inform the component if individual leagues are updating.
        this.leagueService.leagueUpdating.subscribe((leagueUpdatingId: string) => {
            this.currentlyReloadingLeagues.push(leagueUpdatingId);
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

    /**
     * Checks for an individual data set if it is being currently reloaded...
     * @param id
     * @returns
     */
    isDataRefreshing(id: string): boolean {
        return !!this.currentlyReloadingLeagues.find((temp: string) => temp === id);
    }

    isLeagueAdmin(leagueId: string): boolean {
        const leagueIndex: number = this.leagues.findIndex((temp: League) => temp._id === leagueId);
        // if the league exists find the right person...
        if(leagueIndex !== -1) {
            // loop over the members to find yourself in there...
            for(let i = 0 ; i < this.leagues[leagueIndex].members.length ; i++) {
                const member: LeagueMember = this.leagues[leagueIndex].members[i];
                if(member._id === this.user._id) {
                    return member.tags.admin;
                }
            }
        }
        return false;
    }

    toggleNotifications(): void {

    }

    leaveLeague(leagueCode: string): void {

    }

    /**
     * Adds the league code tot he clipboard
     * @param leagueCode
     */
    addLeaguecodeToClipboard(leagueCode: string): void {
        navigator.clipboard.writeText(`http://localhost:4200/#/joinleague/${leagueCode}`).then(result => {
            this.copiedToClipboard = true;
            // show the alert for 3 seconds then fade out.
            setTimeout(() => {
                this.copiedToClipboard = false;
            }, 3000);
        })
    }

    /**
     * Removes the copied to clipboard notification immediately (not wait for fadeout)
     */
    removeCopyNotification(): void { this.copiedToClipboard = false; }

    /**
     * Function a league admin can call to restart the league
     * essentially resets the wordleId from code to today.
     *
     * @param leagueCode
     */
    restartLeague(leagueId: string): void {
        this.leagueService.restartLeague(this.user._id, leagueId).subscribe({
            next: (result: { success: boolean, data: Message }) => {
                this.leagueService.getLeaguesData(this.user._id);
                this.messageService.addMessage(result.data);
        },  error: (error: any) => {
                this.errorMessage = `League could not restart: ${error.message}`;
            }
        })
    }

    /**
     * Function an admin can call to remove a league and all the users within it.
     *
     * @param leagueId
     */
    deleteLeague(leagueId: string): void {
        this.leagueService.deleteLeague(this.user._id, leagueId).subscribe({
            next: (result: { success: boolean, data: Message }) => {
                this.leagueService.getLeaguesData(this.user._id);
                this.messageService.addMessage(result.data);
        },  error: (error: any) => {
                this.errorMessage = `League could not be deleted: ${error.message}`;
            }
        })
    }

    removeUserFromLeague(leagueCode: string, userIdToDelete: string): void {

    }

    /**
     * Opens and closes the create new league box.
     * nneds work on the animation...
     */
    toggleCreateNewLeague(): void {

        if(this.createNewLeague === false) {
            document.getElementById('create-container')?.classList.remove('leagues__create-container--animate-out');
            // its about to change to true... so add the animation.
            document.getElementById('create-container')?.classList.add('leagues__create-container--animate');

            this.createNewLeague = true;
        } else {
            // remove the entry animation
            document.getElementById('create-container')?.classList.add('leagues__create-container--animate-out');
            document.getElementById('create-container')?.classList.remove('leagues__create-container--animate');

            this.createNewLeague = false;
        }
    }
}
