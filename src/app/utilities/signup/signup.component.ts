import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup,  Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { PasswordMatch } from '../password-match';
import { PasswordValidator } from '../password-validator';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {

    form: FormGroup;
    isLoading: boolean = false;

    // errror message
    errorMessage: string = '';

    // regstration subscription
    register: Subscription = new Subscription;

    constructor(
        private auth: AuthenticationService
    ) { }

    ngOnInit(): void {
        this.form = new FormGroup({
            'email': new FormControl(null, { validators: [Validators.email, Validators.required]}),
            'name': new FormControl(null, { validators: [Validators.minLength(3), Validators.required]}),
            'password': new FormControl(null, { validators: [
                                                                Validators.required,
                                                                PasswordValidator.patternValidator(/\d/, { hasNumber: true }),
                                                                PasswordValidator.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
                                                                PasswordValidator.patternValidator(/[a-z]/, { hasSmallCase: true }),
                                                                Validators.minLength(7)
                                                            ]}),
            'passwordRepeat': new FormControl(null, { validators: [Validators.required, ]})
        },
        { validators: [
            PasswordMatch.passwordMatchValidator({ NoPassswordMatch: true })
        ] })
    }

    ngOnDestroy(): void {
        this.register.unsubscribe();
    }

    /**
     * Signs the user up!
     */
    signUp(): void {
        const email: string = this.form.get('email')?.value;
        const username: string = this.form.get('name')?.value;
        const password: string = this.form.get('password')?.value;

        this.register = this.auth.createNewUserWithEmailAndPassword(email, username, password).subscribe({
            next: (result) => {
                console.log(result);
            },
            error: (error) => {
                this.errorMessage = error.error.message;
        }})

    }

}
