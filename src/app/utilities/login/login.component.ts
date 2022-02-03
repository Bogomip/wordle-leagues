import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    form: FormGroup;

    constructor() { }

    ngOnInit(): void {

        // define the form...
        this.form = new FormGroup({
            'email': new FormControl(null, { validators: [Validators.email, Validators.required]}),
            'password': new FormControl(null, { validators: [Validators.required]})
        })

    }

    login(): void {
        const email: string = this.form.get('email')?.value;
        const password: string = this.form.get('password')?.value;
    }

}
