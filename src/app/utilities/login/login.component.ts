import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService, User } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    form: FormGroup;

    // if any errors arise they go into this string...
    errorMessage: string = '';

    constructor(
        private auth: AuthenticationService,
        private router: Router
    ) { }

    ngOnInit(): void {

        // define the form...
        this.form = new FormGroup({
            'email': new FormControl(null, { validators: [Validators.email, Validators.required]}),
            'password': new FormControl(null, { validators: [Validators.required]})
        })

    }

    login(): void {

        if(this.form.invalid) return;

        const email: string = this.form.get('email')?.value;
        const password: string = this.form.get('password')?.value;
        // login...
        this.auth.loginWithUsernameAndPassword(email, password, true).subscribe({
            next: (result: User) => {
                // logged in successfully
                // go back to the home page
                console.log(result);
                this.router.navigate(['']);
            },
            error: (error: any) => {
                // not logged in...
                this.errorMessage = `Error logging in: ${error}`;
            }
        })
    }

}
