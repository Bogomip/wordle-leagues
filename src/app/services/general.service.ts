import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

    menuAnimation: boolean;

    constructor() { }

    /**
     * Gets the current animation status for the menu and the wordle league logo
     * @returns
     */
    getMenuAnimationStatus(): boolean {
        if(!this.menuAnimation) {
            const storedValue: boolean = JSON.parse(localStorage.getItem('animation') as string);
            if(!storedValue) {
                this.menuAnimation = true;
                this.cancelFutureAnimation();
            } else {
                this.menuAnimation = false;
            }
        }
        return this.menuAnimation;
    }

    /**
     * Cancels future animations after first load...
     */
    cancelFutureAnimation(): void {
        localStorage.setItem('animation', JSON.stringify({runAnimation: false}));
    }


    /**
     * Converts the game ID into a date in the format 'Wed 07'
     * @param wordleId
     */
     gameToDate(wordleId: number): string {
        const first: number = new Date('2021-6-19').getTime();
        const id: Date = new Date(first + wordleId * 1000 * 60 * 60 * 24);
        const [dayString, dayValue]: [string, number] = [id.toLocaleDateString('en-gb', { weekday: 'short' }), id.getDate()];
        return `${dayString} ${dayValue}`;
    }

    /**
     * Returns todays game number
     * @returns
     */
    todaysGame(): number {
        const first: number = new Date('2021-6-19').getTime();
        const today: number = new Date().getTime();
        return Math.floor((today - first) / (1000 * 60 * 60 * 24));
    }
}
