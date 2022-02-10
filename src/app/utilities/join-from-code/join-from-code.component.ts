import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthenticationService, User } from 'src/app/services/authentication.service';
import { LeagueService } from 'src/app/services/league.service';

@Component({
  selector: 'app-join-from-code',
  templateUrl: './join-from-code.component.html',
  styleUrls: ['./join-from-code.component.scss']
})
export class JoinFromCodeComponent implements OnInit {

    user: User;
    leagueCode: string;
    success: boolean;
    stage: number = 0;
    userError: string;

    constructor(
        private route: Router,
        private activeRoute: ActivatedRoute,
        private leagueService: LeagueService,
        private auth: AuthenticationService
    ) { }

    ngOnInit(): void {
        // get the parameter for the code to join
        this.leagueCode = this.activeRoute.snapshot.params["id"];
        this.stage = 1;
        // get the user
        this.auth.user.subscribe((user: User) => {
            if(user?._id) {
                this.user = user;
                this.stage = 2;
                // once the user data is retrived create a request top join the league...
                this.joinleague();
            } else {
                this.success = false;
                this.userError = `User was not able to be verified. You may need to log in.`;
            }
        })
    }

    joinleague(): void {
        this.leagueService.joinLeague(this.user._id, this.leagueCode).subscribe({
            next: (result: boolean) => {
                this.stage = 3;
                this.success = true;
                this.route.navigate(['/leagues']);
            },
            error: (error: any) => {
                this.stage = 2;
                this.success = false;
            }
        });
    }
}
