import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';
import { User } from '../user/user.model';

export interface AuthData {
    email: string;
    username: string;
    password: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

    user = new BehaviorSubject<User>(null!);

    constructor(
        private http: HttpClient
    ) { }

    createNewUser(email: string, username: string, password: string): Observable<any> {
        const user: AuthData = { email: email, username: username, password: password };
        return this.http.post('http://localhost:3000/api/user/register', user);
    }
}
