import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup,  Validators } from '@angular/forms';
import { PasswordMatch } from '../password-match';
import { PasswordValidator } from '../password-validator';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

    form: FormGroup;

    constructor() { }

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

    signUp(): void {

    }

}
