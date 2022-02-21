import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';
import { Router } from '@angular/router';
import { MessagesService } from './messages.service';
import { environment } from 'src/environments/environment';

export interface AuthData {
    email: string;
    password: string;
    remainLoggedIn: boolean;
    username?: string;
}

export interface User {
    _id: string;
    token: string;
    name: string;
    email: string;
    joinDate: number;
    leagues: string[];
}

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

    user = new BehaviorSubject<User>(null!);
    token: string = '';

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    /**
     * Creates a new user based upon an email and password system...
     *
     * @param email
     * @param username
     * @param password
     * @returns
     */
    createNewUserWithEmailAndPassword(email: string, username: string, password: string): Observable<User> {
        const user: AuthData = { email: email, username: username, password: password, remainLoggedIn: false };

        // change this any to something...
        return this.http.post<User>(environment.apiUrl+'api/user/register', user)
        .pipe(take(1), tap({
            next: (user: User) => {
                this.saveCredentialsLocally(user);
                // upon signup the token is returned and login is automatic...
                this.handleUserLoggedIn(user);
            },
            error: (error: any) => {
                console.log(error);
            }
        }));
    }

    /**
     * Logs a user in with their email and their password...
     *
     * @param email
     * @param password
     * @param remainLoggedIn
     * @returns
     */
    loginWithUsernameAndPassword(email: string, password: string, remainLoggedIn: boolean): Observable<User> {
        const user: AuthData = { email: email, password: password, remainLoggedIn: remainLoggedIn };

        console.log(`Logging in: ${environment.apiUrl+'api/user/login'}`);

        return this.http.post<User>(environment.apiUrl+'api/user/login', { email: email, password: password, remainLoggedIn: remainLoggedIn })
        .pipe(take(1), tap({
            next: (user: User) => {
                this.saveCredentialsLocally(user);
                this.handleUserLoggedIn(user);
            }
        }));
    }

    /**
     * Do whatever is necessary after the user has successfully been verified as a user...
     * (Currently just push the new user onto the subject)
     *
     * @param userData
     */
    handleUserLoggedIn(userData: User): void {
        this.token = userData.token;
        this.user.next(userData);
    }

    /**
     * Upon launch, checks if the user exists (is logged in) and propogates it if they are...
     * @returns
     */
    checkLoginStatusOnLoad(): void {
        const localUserData: User = JSON.parse(localStorage.getItem('user')!);
        // check if its exists...
        if(!localUserData) return;
        this.handleUserLoggedIn(localUserData);
        // check the user session is still active and if not, log the user out.
        this.http.get(environment.apiUrl+'api/user/checktoken').subscribe({
            next: (result: any) => {
                // do nothing in the case of success :)
                console.log(`Success: ${result}`);
            },
            error: (error: any) => {
                console.log(`Error: ${error.message}`);
                this.logout();
            }
        })
    }

    /**
     * Save credentials in local storage so refreshing will keep them in...
     * @param user
     */
    saveCredentialsLocally(user: User): void {
        localStorage.setItem('user', JSON.stringify(user));
    }

    /**
     * Simply returns the token for use in cases where the observable cannot exist.
     * @returns
     */
    getToken(): string {
        return this.token;
    }

    /**
     * Logs the user out...
     */
    logout(): void {
        localStorage.removeItem('user');
        this.user.next(null!);
        this.router.navigate(['/']);
    }
}
