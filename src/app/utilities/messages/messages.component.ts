import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService, User } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

    user: User;

    constructor(
        private http: HttpClient,
        private auth: AuthenticationService
    ) { }

    ngOnInit(): void {
        // get the user...
        this.auth.user.subscribe((user: User) => this.user = user );
        this.getMessages();
    }

    getMessages(): void {
        this.http
            .get('http://localhost:3000/api/messages/all')
            .subscribe({
                next: (result: any) => {
                    console.log(result);
                },
                error: (error: any) => {
                    console.log(error);
                }
            })
        }

        dismissMessage(messageId: string): void {
        this.http
        .post('http://localhost:3000/api/messages/delete', { messageId: messageId })
        .subscribe({
            next: (result: any) => {
                    console.log(result);
                },
                error: (error: any) => {
                    console.log(error);
                }
            })
    }

}
