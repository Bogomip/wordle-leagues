import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, take, tap } from 'rxjs';
import { AuthenticationService, User } from './authentication.service';

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

    // subscribable values to alert other components to changes or impensing changes.
    leagues = new BehaviorSubject<League[]>(null!);
    leagueUpdating = new Subject<string>();

    private leaguesLocal: League[] = [];

    constructor(
        private auth: AuthenticationService,
        private http: HttpClient
    ) { }

    ngOnInit(): void {
        // subscribe to and collect user data as it is changed or modified...
        this.auth.user.subscribe((user: User) => {
            this.user = user;
            this.getLeaguesData(user._id);
        })

    }

    ngOnDestroy(): void {
        console.log("destroy!");
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
    getLeaguesData(id: string): void {
        // alert all the currently active leagues they are going to be updated...
        this.leaguesLocal.forEach((league: League) => this.leagueUpdating.next(league._id));
        // add the subscription to the subscriptions object
        this.subscriptions['leaguesub'] = this.http.get<{success: boolean, data: League[]}>('http://localhost:3000/api/data/all/userId=' + id).subscribe({
            next: (result: {success: boolean, data: League[]}) => {
                this.leaguesLocal = [...result.data];   // store a local version
                this.leagues.next([...this.leaguesLocal]);    // emit the full version to subscribers
        }})
    }

    /**
     * Retrieves the data for one individual league...
     * @param id
     * @returns
     */
     getLeagueData(id: string, leagueId: string): void {
        // alert components this league is being updated...
        this.leagueUpdating.next(leagueId);
        // add the subscription to the subscriptions object
        this.subscriptions['leaguesub'] = this.http.get<{success: boolean, data: League}>(`http://localhost:3000/api/data/league/userId=${id}&leagueId=${leagueId}`).subscribe({
            next: (result: {success: boolean, data: League}) => {
                // find the league from the local array and replace it.
                const leagueIndex: number = this.leaguesLocal.findIndex((temp: League) => temp._id === leagueId);
                if(leagueIndex !== -1) {
                    this.leaguesLocal[leagueIndex] = result.data;
                }
                // and after changing the local version, reemit the whole thing...
                this.leagues.next([...this.leaguesLocal]);
        }})
    }

}
