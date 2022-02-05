import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { GeneralService } from './services/general.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    runAnimation: boolean = true;
    title = 'wordle-leagues';

    constructor(
        private generalService: GeneralService,
        private auth: AuthenticationService
        ) {
    }

    ngOnInit(): void {
        this.auth.checkLoginStatusOnLoad();
        this.runAnimation = this.generalService.getMenuAnimationStatus();
    }

}
