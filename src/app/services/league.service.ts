import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MessagesComponent } from '../utilities/messages/messages.component';
import { AuthenticationService, User } from './authentication.service';

export interface League {
    _id: string;
    code: string;
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
export class LeagueService implements OnDestroy {

    user: User;
    private subscriptions: { [key: string] : Subscription } = {};

    // subscribable values to alert other components to changes or impensing changes.
    leagues = new BehaviorSubject<League[]>([]);
    leagueUpdating = new Subject<string>();

    private leaguesLocal: League[] = [];

    constructor(
        private auth: AuthenticationService,
        private http: HttpClient
    ) {
        // subscribe to and collect user data as it is changed or modified...
        this.auth.user.subscribe((user: User) => {
            if(user) {
                this.user = user;
                this.getLeaguesData(user._id);
            }
        })
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
    getLeaguesData(id: string): void {
        // alert all the currently active leagues they are going to be updated...
        this.leaguesLocal.forEach((league: League) => this.leagueUpdating.next(league._id));
        // add the subscription to the subscriptions object
        this.subscriptions['leaguesub'] = this.http.get<{success: boolean, data: League[]}>(environment.apiUrl+'/api/data/all/userId=' + id).subscribe({
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
     getLeagueData(leagueId: string): void {
        // alert components this league is being updated...
        this.leagueUpdating.next(leagueId);
        // add the subscription to the subscriptions object
        this.subscriptions['leaguesub'] = this.http.get<{success: boolean, data: League}>(environment.apiUrl+`/api/data/league/leagueId=${leagueId}`).subscribe({
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

    /**
     * Joins a league for a user, returns an observable. Tidy this up?
     * @param userId
     * @param leagueCode
     * @returns
     */
    joinLeague(userId: string, leagueCode: string): Observable<any> {
        return this.http.post(environment.apiUrl+'/api/league/join', { userId: userId, leagueCode: leagueCode }).pipe(take(1), tap({
            next: (result: any) => {
                return true;
        },  error: (error: any) => {
                return false;
        }}));
    }

    /**
     * Has a user leave a league
     * @param userId
     * @param leagueCode
     * @returns
     */
    leaveLeague(leagueId: string): Observable<any> {
        return this.http.post(environment.apiUrl+'/api/league/leave', { leagueId: leagueId }).pipe(take(1), tap({
            next: (result: any) => {
                return true;
        },  error: (error: any) => {
                return false;
        }}));
    }

    /**
     * Deletes a league from the system... causes a message to be pushed to all users with the final results.
     * @param adminId
     * @param leagueId
     * @returns
     */
    deleteLeague(leagueId: string): Observable<any> {
        return this.http.post<any>(environment.apiUrl+'/api/league/delete', { leagueId: leagueId }).pipe(take(1), tap({
            next: (result: any) => {
                console.log(result);
        },  error: (error: any) => {
                return false;
        }}));
    }

    /**
     * Restarts a league... causes a message to be pushed to all users with the final results.
     * @param adminId
     * @param leagueCode
     * @returns
     */
    restartLeague(leagueId: string): Observable<any> {
        return this.http.post(environment.apiUrl+'/api/league/restart', { leagueId: leagueId }).pipe(take(1), tap({
            next: (result: any) => {
                return true;
        },  error: (error: any) => {
                return false;
        }}));
    }

    deleteUser(leagueId: string, userToDelete: string): Observable<any> {
        return this.http.delete<{ success: boolean }>(environment.apiUrl+`/api/league/removeuser?userToDelete=${userToDelete}&leagueId=${leagueId}&adminName=${this.user.name}`).pipe(take(1), tap({
            next: (result: { success: boolean }) => {
                // success, now remove the user locally.
                let newLeagues: League[] = [...this.leaguesLocal];
                const leagueIndex: number = newLeagues.findIndex((temp: League) => temp._id.toString() === leagueId.toString());
                const userIndex: number = newLeagues[leagueIndex].members.findIndex((temp: LeagueMember) => temp._id.toString() === userToDelete.toString());
                newLeagues[leagueIndex].members.splice(userIndex, 1);
                // and update the app.
                this.leaguesLocal = [...newLeagues];
                this.leagues.next(newLeagues);
            },
            error: (error: any) => {

            }
        }))
    }

}
