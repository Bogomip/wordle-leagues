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
}
