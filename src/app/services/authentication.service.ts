import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../user/add-results/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

    user = new BehaviorSubject<User>(null!);

    constructor() { }
}
