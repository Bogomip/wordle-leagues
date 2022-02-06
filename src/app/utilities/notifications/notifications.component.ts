import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationService, User } from 'src/app/services/authentication.service';

export interface WordleNotification {
    _id: string; name: string; score: number; leaguename: string
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

    // user data
    user: User;

    // notifications and leagues data..
    notifications: WordleNotification[] = [
        { _id: '123', name: 'Rosemary', score: 3, leaguename: 'Pavanders' },
        { _id: '256', name: 'Ken', score: 3, leaguename: 'Pavanders' },
        { _id: '1244', name: 'Sian', score: 2, leaguename: 'Pavanders' },
        { _id: '12311', name: 'Clare', score: 5, leaguename: 'Pavanders' },
        { _id: '12310', name: 'Alex', score: 4, leaguename: 'Pavanders' },
    ]

    leagues: string[] = ['Pavanders'];

    // subscriptions...
    notificationsSubscription: Subscription;
    loadingNotificationsSubscription: Subscription;

    // loading variables
    isLoading: boolean = false;

    // error
    errorMessage: string = '';

    constructor(
        private auth: AuthenticationService,
        private http: HttpClient
    ) { }

    ngOnInit(): void {
        this.auth.user.subscribe((user: User) => {
            this.user = user;
        })
    }

    /**
     * Retrive notifications from the database.
     */
    getNotifications(): void {
        this.isLoading = true;
        const userId: string = '12345'; // why does this.user.id not work?

        this.http.get<WordleNotification[]>('http://localhost:3000/api/notifications?id=' + userId).subscribe(
        {
            next: (data: WordleNotification[]) => {

                this.isLoading = false;
            },
            error: (error: any) => {
                this.errorMessage = 'Your notifications failed to load... give it a minute then try again by clicking here!';
                this.isLoading = false;
            }
        })
    }

    /**
     * Gets all members of a league in the notifications...
     * @param leagueName
     * @returns
     */
    getLeagueUsers(leagueName: string): WordleNotification[] {
        return this.notifications.filter((user: WordleNotification) => user.leaguename === leagueName);
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

        // after 1 second trigger the removal from the db...
        setTimeout(() => {
            this.notifications = [...this.notifications.filter((notification: WordleNotification) => notification._id !== user._id)];
            // check if this league still has any players and if no remove it from the list...
            const leagueUserCount: number = this.getLeagueUsers(user.leaguename).length;

            if(leagueUserCount === 0) {
                this.leagues = [...this.leagues.filter((league: string) => league !== user.leaguename)];
            }
        }, 1000);
    }

    /**
     * If a get fails, this will retry the notifications db.
     */
    retryNotificationsGet(): void {
        this.errorMessage = '';
        this.getNotifications();
    }

}
