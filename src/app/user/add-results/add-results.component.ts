import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationService, User } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-add-results',
  templateUrl: './add-results.component.html',
  styleUrls: ['./add-results.component.scss']
})
export class AddResultsComponent implements OnInit, OnDestroy {

    // error message and controls...
    errorMessage: string = '';
    showSubmitBox: boolean = true;
    gamesToSubmit: { id: number, date: string, submitting: boolean, value: number }[] = [];

    // submit subscirption
    submitSubscription: Subscription = new Subscription;

    // user data...
    user: User;

    constructor(
        private auth: AuthenticationService,
        private http: HttpClient
    ) { }

    ngOnInit(): void {

        this.loadGames();

        this.auth.user.subscribe((user: User) => {
            this.user = user;
        })
     }

    ngOnDestroy(): void {
        this.submitSubscription.unsubscribe();
    }

    loadGames(): void {
        // test data...
        this.gamesToSubmit = [
            { id: 231, date: this.gameToDate(231), submitting: false, value: -1 },
            { id: 232, date: this.gameToDate(232), submitting: false, value: -1 }
        ]
    }

    submitScore(wordleId: number, score: number): void {
        const accessGame: { id: number, date: string, submitting: boolean, value: number } = this.gamesToSubmit.find((test) => test.id === wordleId)!;
        if(accessGame) {
            // set the values on the front end...
            accessGame.value = score;
            // accessGame.submitting = true;

            // and call the backend...
            this.http.post<{ message: string }>('http://localhost:3000/api/user/score', { userId: this.user._id, wordleId: wordleId, score: score}).subscribe({
                next: (result: { message: string }) => {
                    console.log(result);
                },
                error: (error: any) => {
                    console.log(error);
                }
            })

        } else {
            // game not found?
            // reload games as something went wrong...
            this.loadGames();
        }
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
     * Hides the submit box
     */
    hide(): void {
        this.showSubmitBox = false;
    }


}
