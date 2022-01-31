import { AfterViewInit, Component, OnInit } from '@angular/core';
import { GeneralService } from './services/general.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    runAnimation: boolean = true;
    title = 'wordle-leagues';

    constructor(private generalService: GeneralService) {
    }

    ngOnInit(): void {
        this.runAnimation = this.generalService.getMenuAnimationStatus();
    }

}
