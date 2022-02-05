import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-results',
  templateUrl: './add-results.component.html',
  styleUrls: ['./add-results.component.scss']
})
export class AddResultsComponent implements OnInit, OnDestroy {

    // forma nd error message...
    form: FormGroup;
    errorMessage: string = '';

    // submit subscirption
    submitSubscription: Subscription = new Subscription;

    constructor(
        private http: HttpClient
    ) { }

    ngOnInit(): void {
        this.form = new FormGroup({
            'data': new FormControl(null, { validators: [Validators.required]})
        })
    }

    ngOnDestroy(): void {
        this.submitSubscription.unsubscribe();
    }

    showSubmitBox: boolean = true;

    hide(): void {
        this.showSubmitBox = false;
    }

    submitScore(): void {
        // parse the data into the expected format.
        const data: string = this.form.get('data')?.value?.split(" ") || 'error';
        const wordleDay: number = 229;

        if(data[0] === "Wordle") {
            if(+data[1] === wordleDay) {
                const scoreSplit: string[] = data[2].split('/');
                if(['1','2','3','4','5','6','X'].includes(scoreSplit[0])) {

                    // submit to database...
                    this.submitSubscription = this.http.post('http://localhost:3000/api/', { score: scoreSplit[0] }).subscribe({
                        next: (result) => {

                        },
                        error: (error: any) => {
                            console.log("Error dubmitting to database: " + error);
                        }
                    })

                } else {
                    this.errorMessage = "Your score is provided in an incorrect format. Please ensure you do not format the score from what is provided by Wordle."
                }
            } else {
                this.errorMessage = "Your Wordle data is for the wrong day! You can only submit todays or yesterdays Wordle score..."
            }
        } else {
            this.errorMessage = "Your Wordle data is in an incorrect format or may be for another Wordle style game..."
        }

    }

}
