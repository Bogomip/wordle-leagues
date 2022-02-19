import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { GeneralService } from './services/general.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component2.html',
  styleUrls: ['./app.component2.scss']
})
export class AppComponent implements OnInit {

    runAnimation: boolean = true;

    constructor(
        private generalService: GeneralService,
        private auth: AuthenticationService,
        private title: Title,
        private activeRoute: ActivatedRoute,
        private router: Router
        )
    {
        // subscribe and react to route events...
        router.events.subscribe((event: any) => {
            // when navigation ends
            if(event instanceof NavigationEnd) {
                this.setPageTitle(this.activeRoute.firstChild?.snapshot.data['title']);
            }
        })
    }

    ngOnInit(): void {
        this.auth.checkLoginStatusOnLoad();
        this.runAnimation = this.generalService.getMenuAnimationStatus();
    }

    /**
     * Set the page title...
     * @param titleString
     */
    setPageTitle(titleString: string): void {
        this.title.setTitle(titleString);
    }

}
