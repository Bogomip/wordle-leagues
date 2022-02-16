import { Component, OnInit } from '@angular/core';
import { AuthenticationService, User } from 'src/app/services/authentication.service';
import { GeneralService } from 'src/app/services/general.service';
import { MessagesService } from 'src/app/services/messages.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

    menuAnimation: boolean = true;
    user: User;

    constructor(
        private generalService: GeneralService,
        private auth: AuthenticationService,
        private messageService: MessagesService
    ) { }

    ngOnInit(): void {
        this.menuAnimation = this.generalService.getMenuAnimationStatus();
        // get the user object...
        this.auth.user.subscribe((user: User) => {
            this.user = user;
        })
    }

    logout(): void {
        this.messageService.clearMessages();
        this.auth.logout();
    }

}
