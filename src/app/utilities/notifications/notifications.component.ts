import { Component, OnInit } from '@angular/core';

export interface WordleNotification {
    _id: string; name: string; score: number; leaguename: string
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

    notifications: WordleNotification[] = [
        { _id: '123', name: 'Rosemary', score: 3, leaguename: 'Pavanders' },
        { _id: '256', name: 'Ken', score: 3, leaguename: 'Pavanders' },
        { _id: '1244', name: 'Sian', score: 2, leaguename: 'Pavanders' },
        { _id: '12311', name: 'Clare', score: 5, leaguename: 'Pavanders' },
        { _id: '12310', name: 'Alex', score: 4, leaguename: 'Pavanders' },
    ]

    leagues: string[] = ['Pavanders'];

    constructor() { }

    ngOnInit(): void {
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

}
