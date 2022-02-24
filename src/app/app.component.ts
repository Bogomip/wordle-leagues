import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { environment } from 'src/environments/environment';
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
        private router: Router,
        private http: HttpClient
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

    testAPIInterface(): void {

        this.http.get(environment.apiUrl+'/api/data/test').subscribe((result) => {
            console.log(`data test: ${result.toString()}`);
        })
        this.http.get(environment.apiUrl+'/api/user/test').subscribe((result) => {
            console.log(`user test: ${result.toString()}`);
        })
        this.http.get(environment.apiUrl+'/api/messages/test').subscribe((result) => {
            console.log(`messages test: ${result.toString()}`);
        })
        this.http.get(environment.apiUrl+'/api/league/test').subscribe((result) => {
            console.log(`league test: ${result.toString()}`);
        })

    }

    ngOnInit(): void {
        this.auth.checkLoginStatusOnLoad();
        this.runAnimation = this.generalService.getMenuAnimationStatus();
        this.testAPIInterface();
    }

    /**
     * Set the page title...
     * @param titleString
     */
    setPageTitle(titleString: string): void {
        this.title.setTitle(titleString);
    }

}
