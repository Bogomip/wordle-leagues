import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationService, User } from 'src/app/services/authentication.service';
import { GeneralService } from 'src/app/services/general.service';
import { League, LeagueMember, LeagueService } from 'src/app/services/league.service';

export interface WordleNotification {
    _id: string; name: string; wordleId: number; score: number; leagueName: string; leagueId: string; seen: boolean;
}

interface LeagueIdentifier {
    _id: string; name: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

    // user data
    user: User;

    leagues: LeagueIdentifier[] = [];

    // subscriptions...
    notificationsSubscription: Subscription;
    loadingNotificationsSubscription: Subscription;

    // loading variables
    isLoading: boolean = false;

    // error
    errorMessage: string = '';

    constructor(
        private auth: AuthenticationService,
        private http: HttpClient,
        private leagueService: LeagueService,
        private generalService: GeneralService
    ) { }

    ngOnInit(): void {
        // user subscription
        this.auth.user.subscribe((user: User) =>  this.user = user )
        // league subscription...
        this.leagueService.leagues.subscribe((leagues: League[]) => { if(leagues.length > 0) this.processNewLeagueData(leagues) });
        // league updating...
        this.leagueService.leagueUpdating.subscribe((leagueId: string) => this.leagueCurrentlyUpdating(leagueId));
    }

    /**
     * If a league is currently being updated then visually show it is being updated...
     * @param leagueId
     */
    leagueCurrentlyUpdating(leagueId: string): void {

    }


    // notifications and leagues data..
    notifications: WordleNotification[] = []


    // new leagues data has just been triggered so update everything...
    processNewLeagueData(leagues: League[]): void {
        // get todays league id as these are the only notifications that matter...
        const wordleNumber: number = this.generalService.todaysGame();
        let newNotifications: WordleNotification[] = [];
        let newLeagues: LeagueIdentifier[] = [];
        // sort the local data...
        let localData: WordleNotification[] = JSON.parse(localStorage.getItem('notifications')!);
        let todaysLocalData: WordleNotification[] = localData ? localData.filter((temp: WordleNotification) => temp.wordleId === wordleNumber) : []; // filter only todays wordles...

        // iterate over each league...
        for(let i = 0; i < leagues.length ; i++) {
            // and iterate over each member...
            // add them to the main array if they have done todays wordle...
            leagues[i].members.forEach((member: LeagueMember) => {
                if(member.today && (member._id !== this.user._id)) {
                    // check for if any notifications from this person have been seen and removed...
                    const seen: boolean = todaysLocalData.find((temp: WordleNotification) => temp._id === member._id && temp.score === member.today)?.seen || false;
                    const notification: WordleNotification = { _id: member._id, name: member.name, wordleId: wordleNumber, score: member.today, leagueName: leagues[i].name, leagueId: leagues[i]._id, seen: seen };
                    newNotifications.push(notification);
                    // check if the league is already in the league array and if not, add it...
                    if(!newLeagues.find((temp: LeagueIdentifier) => leagues[i]._id === temp._id)) newLeagues.push({ _id: leagues[i]._id, name: leagues[i].name});
                }
            })
        }
        // store locally...
        localStorage.setItem('notifications', JSON.stringify(newNotifications));
        // push to main notifications array...
        this.notifications = [...newNotifications];
        // push tot he leagues array
        this.leagues = newLeagues;
        // remove emoty leagues...
        this.removeEmptyLeagues();
    }

    /**
     * Gets all members of a league in the notifications...
     * @param leagueName
     * @returns
     */
    getLeagueUsers(leagueId: string): WordleNotification[] {
        return this.notifications.filter((user: WordleNotification) => user.leagueId === leagueId && user.seen === false);
    }

    /**
     * Creates an array from a score so the foreach works!
     * @param score
     * @returns
     */
    getScoreAsArray(score: number) : number[] {
        return new Array(score);
    }

    /**
     * Remove a users notifications from the lists...
     * @param id
     */
    removeNotification(user: WordleNotification): void {
        // add the delete class to all of the elements...
        const userElements: HTMLCollectionOf<Element> = document.getElementsByClassName(user._id);
        for(let i = 0; i < userElements.length; i++) {
            userElements[i].classList.add('delete');
        }

        // get the local notifications data and set seen to true for this user everywhere.
        let localData: WordleNotification[] = JSON.parse(localStorage.getItem('notifications') || '[]') || [];

        for(let i = 0; i < localData.length ; i++) {
            if(localData[i]._id === user._id) localData[i].seen = true;
        }

        // reupload local data...
        localStorage.setItem('notifications', JSON.stringify(localData));

        // after 1 second trigger the removal from the db...
        setTimeout(() => {
            this.notifications = [...this.notifications.filter((notification: WordleNotification) => notification._id !== user._id)];
            // check all leagues to see if notifications still exist...
            this.removeEmptyLeagues();
        }, 1000);
    }

    /**
     * Removes all empty leagues from the system...
     */
    removeEmptyLeagues(): void {
        let newLeagueArray: LeagueIdentifier[] = [];
        // iterate over all notifications...
        for(let i = 0 ; i < this.leagues.length ; i++) {
            const league: LeagueIdentifier = this.leagues[i];
            const leagueUserCount: number = this.notifications.filter((temp: WordleNotification) => temp.leagueId === league._id && temp.seen === false).length;
            console.log(this.notifications);

            if(leagueUserCount !== 0) {
                newLeagueArray.push(this.leagues[i]);
            }
        }
        this.leagues = [...newLeagueArray];
    }

    /**
     * Updates the local storage to reflect a users new scores have been seen
     * @param userId
     */
    updateLocalNotificationsStorage(userId: string): void {

    }

    /**
     * If a get fails, this will retry the notifications db.
     */
    // retryNotificationsGet(): void {
    //     this.errorMessage = '';
    //     this.getNotifications();
    // }

}
