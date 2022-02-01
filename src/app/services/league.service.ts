import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../user/user.model';
import { AuthenticationService } from './authentication.service';

export interface League {
    _id: string;
    name: string;
    notificationsAllowed: boolean;
    members: LeagueMember[];
}

export interface LeagueMember {
    _id: string;
    name: string;
    tags: { admin: boolean; pastWinner: boolean; pastRunnerUp: boolean };
    score: { 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; fail: number; }
    today?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    joinTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeagueService implements OnInit, OnDestroy {

    user: User;
    private subscriptions: { [key: string] : Subscription } = {};

    leagues: League[] = [
        {
            _id: 'blah',
            name: 'Pavanders',
            notificationsAllowed: true,
            members: [
                  {  _id: '1', name: 'Rosemary', tags: { admin: false, pastWinner: true, pastRunnerUp: false }, score: { 1: 0, 2: 1, 3: 6, 4: 4, 5: 0, 6: 1, fail: 0 }, today: 3, joinTime: new Date().getTime() },
                  {  _id: '2', name: 'Kev', tags: { admin: false, pastWinner: false, pastRunnerUp: false }, score: { 1: 1, 2: 0, 3: 3, 4: 8, 5: 0, 6: 0, fail: 0 }, today: 2, joinTime: new Date().getTime() },
                  {  _id: '3', name: 'Sian', tags: { admin: true, pastWinner: false, pastRunnerUp: true }, score: { 1: 0, 2: 0, 3: 4, 4: 6, 5: 1, 6: 0, fail: 0 }, today: 6, joinTime: new Date().getTime() },
                  {  _id: '4', name: 'Clare', tags: { admin: false, pastWinner: false, pastRunnerUp: false }, score: { 1: 0, 2: 1, 3: 4, 4: 3, 5: 0, 6: 2, fail: 0 }, today: 5, joinTime: new Date().getTime() }
            ]
        }
    ]

    constructor(
        private auth: AuthenticationService,
        private http: HttpClient
    ) { }

    ngOnInit(): void {
        // subscribe to and collect user data as it is changed or modified...
        this.auth.user.subscribe((user: User) => {
            this.user = user;
        })

        this.getLeaguesData();
    }

    ngOnDestroy(): void {
        // unsubscribe to everything!
        for(let [key, subscription] of Object.entries(this.subscriptions)) {
            subscription.unsubscribe();
        }
    }

    /**
     * Retrieves the leagues data...
     * @param id
     * @returns
     */
    getLeaguesData(id?: string): League[] {
        // add the subscription to the subscriptions object
        this.subscriptions['getleaguedata'] = this.http.get('http://localhost:3000/data/all?pies=yes').subscribe((result) => {
            console.log(result);
        })
        // return a new instance...
        return [...this.leagues];
    }

}
