import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService, User } from 'src/app/services/authentication.service';
import { Message, MessagesService } from 'src/app/services/messages.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

    user: User;
    messages: Message[] = [];

    constructor(
        private http: HttpClient,
        private auth: AuthenticationService,
        private messageService: MessagesService
    ) { }

    ngOnInit(): void {
        // get the user...
        this.auth.user.subscribe((user: User) => this.user = user );
        this.messageService.messagesObservable.subscribe((messages: Message[]) => { this.messages = messages; });
        // trigger a message update
        this.messageService.getMessages();
    }

    /**
     * Add a message onto the message string...
     * @param message
     */
    addMessage(message: Message): void {
        this.messages.push(message);
    }

    /**
     * Removes a message from the database.
     * @param messageId
     */
    dismissMessage(messageId: string): void {
        this.messageService.dismissMessage(messageId).subscribe({
            next: (result: boolean) => {
                // success
                document.getElementById(messageId)?.classList.add('message-quick__shrink');
            },
            error: (error: any) => {
                console.log(error);
            }
        })
    }

}
