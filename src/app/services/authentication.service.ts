import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';
import { User } from '../user/user.model';

export interface AuthData {
    email: string;
    password: string;
    remainLoggedIn: boolean;
    username?: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

    user = new BehaviorSubject<User>(null!);

    constructor(
        private http: HttpClient
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
        return this.http.post<User>('http://localhost:3000/api/user/register', user)
        .pipe(take(1), tap({
            next: (user: User) => {
                this.saveCredentialsLocally(user);
                // upon signup the token is returned and login is automatic...
                this.handleUserLoggedIn(user);
            },
            error: (error: any) => {}
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

        return this.http.post<User>('http://localhost:3000/api/user/login', { email: email, password: password, remainLoggedIn: remainLoggedIn })
        .pipe(take(1), tap({
            next: (user: User) => {
                this.saveCredentialsLocally(user);
                this.handleUserLoggedIn(user);
            },
            error: (error: any) => {}
        }));
    }

    /**
     * Do whatever is necessary after the user has successfully been verified as a user...
     * (Currently just push the new user onto the subject)
     *
     * @param userData
     */
    handleUserLoggedIn(userData: User): void {
        this.user.next(userData);
    }

    /**
     * Upon launch, checks if the user exists (is logged in) and propogates it if they are...
     * @returns
     */
    checkLoginStatusOnLoad(): void {
        const localUserData = localStorage.getItem('user');
        // check if its exists...
        if(!localUserData) return;
        // and if it does, handle it!
        this.handleUserLoggedIn(localUserData);
    }

    /**
     * Save credentials in local storage so refreshing will keep them in...
     * @param user
     */
    saveCredentialsLocally(user: User): void {
        localStorage.setItem('user', JSON.stringify(user));
    }

    logout(): void {
        localStorage.removeItem('user');
        this.user.next(null!);
    }
}
