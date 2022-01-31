import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

    menuAnimation: boolean = true;

    constructor(private generalService: GeneralService) { }

    ngOnInit(): void {
        this.menuAnimation = this.generalService.getMenuAnimationStatus();
    }

}
