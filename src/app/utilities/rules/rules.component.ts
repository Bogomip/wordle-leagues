import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: [  './rules.component.scss',
                '../../leagues/leagues.component.scss',
                '../../user/add-results/add-results.component.scss']
})
export class RulesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
