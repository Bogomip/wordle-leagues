import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

    resizeObserver: ResizeObserver;
    resizeElement: HTMLElement;

    // rem of each small icon
    backgroundWidth: number = 50;

    // background icons
    elements: number;
    elementArray: number[] = [];

    constructor() { }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.observeElementSizeChange();
    }

    /**
         * Set up an observer on the mesaages div to reclaucltae the posts that can be displayed.
         */
    observeElementSizeChange(): void {
        this.resizeElement =  document.getElementById('home') as HTMLElement;
        this.resizeObserver = new ResizeObserver(() => {
            try {
                const height: number = this.resizeElement.offsetHeight || 0;
                const width: number = this.resizeElement.offsetWidth || 0;
                const area: number = height * width;
                const areaOfBackground: number = this.backgroundWidth * this.backgroundWidth;
                this.elements = Math.floor(area / areaOfBackground);
                this.elementArray = [...Array(this.elements).keys()];
            } catch(e) {  }
        });
        this.resizeObserver.observe(this.resizeElement);
    }

    getBackgroundElements(): number[] {
        return [...this.elementArray];
    }

    getRandomLetter(i: number): string {
        const letters: string = "AWZSEXDRCFTVGYBHUNJIMKOLPQ";
        const rand: string = letters.charAt(i);
        return rand;
    }

    getRandomColor(i: number): string {
        const val: number = i % 26;
        const letters: string = "BVNCMXZLGKFJDHSAPIOYUTRWEQ";
        const comparison: string = "QWERTYUIOPASDFGHJKLZXCVBNM";
        const rand1: string = letters.charAt(val);
        const rand2: string = comparison.charAt(val);
        return rand1 < rand2 ? 'green' :  rand1 > rand2 ? 'yellow' : 'gray';
    }


}
