import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationService, User } from 'src/app/services/authentication.service';
import { LeagueService } from 'src/app/services/league.service';

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
        private http: HttpClient,
        private leagueService: LeagueService
    ) { }

    ngOnInit(): void {
        // subscribe to the user, and once thats done find the last two games...
        this.auth.user.subscribe((user: User) => {
            this.user = user;
            this.loadGames();
        })
     }

    ngOnDestroy(): void {
        this.submitSubscription.unsubscribe();
    }

    loadGames(): void {

        const todaysGame: number = this.todaysGame();
        // the only allowable values to change....
        this.gamesToSubmit = [
            { id: todaysGame - 1, date: this.gameToDate(todaysGame - 1), submitting: false, value: -1 },
            { id: todaysGame, date: this.gameToDate(todaysGame), submitting: false, value: -1 }
        ]
        // get the data from the database...
        this.http.post<{ success: boolean, data: any}>('http://localhost:3000/api/data/daily', { userId: this.user._id, gameId: todaysGame}).subscribe({
            next: (result: { success: boolean, data: any[] }) => {
                // iterate over all data points and see if any exist that we have submitted...
                for(let dataPoint of result.data) {
                    const dataIndex: number = this.gamesToSubmit.findIndex((temp) => temp.id === dataPoint.wordleId);
                    // if it exists update the main array..
                    if(dataIndex !== -1) {
                        this.gamesToSubmit[dataIndex].value = dataPoint.score;
                    }
                }
            },  error: (error: any) => {
                console.log(`${error.message}`);
            }
        })
    }

    submitScore(wordleId: number, score: number): void {
        // find the game in question...
        const accessGame: { id: number, date: string, submitting: boolean, value: number } = this.gamesToSubmit.find((test) => test.id === wordleId)!;
        // if its a game you are able to access then update the score...
        if(accessGame) {
            // set the values on the front end...
            accessGame.value = score;
            accessGame.submitting = true;

            // and call the backend...
            this.http.post<{ message: string }>('http://localhost:3000/api/user/score', { userId: this.user._id, wordleId: wordleId, score: score}).subscribe({
                next: (result: { message: string }) => {
                    // update all leagues...
                    this.leagueService.getLeaguesData(this.user._id);
                    // stop the spinner..
                    accessGame.submitting = false;
                },
                error: (error: any) => {
                    console.log(`Error: ${error}`);
                    // stop the spinner..
                    accessGame.submitting = false;
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
     * Returns todays game number
     * @returns
     */
    todaysGame(): number {
        const first: number = new Date('2021-6-19').getTime();
        const today: number = new Date().getTime();
        return Math.floor((today - first) / (1000 * 60 * 60 * 24));
    }


    /**
     * Hides the submit box
     */
    hide(): void {
        this.showSubmitBox = !this.showSubmitBox;
    }


}
