import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { User } from '../user/add-results/user.model';
import { AuthenticationService } from './authentication.service';

export interface League {
    _id: string;
    name: string;
    notificationsAllowed: boolean;
    members: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LeagueService implements OnInit {

    user: User;

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

    getLeaguesData(id?: string) {

        this.http.get('http://localhost:3000/data/all?pies=yes').subscribe((Result) => {
            console.log(Result);
        })

    }
}
