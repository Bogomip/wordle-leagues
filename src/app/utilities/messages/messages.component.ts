import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit } from '@angular/core';
import { from, Subscription } from 'rxjs';
import { AuthenticationService, User } from 'src/app/services/authentication.service';
import { Message, MessagesService } from 'src/app/services/messages.service';
import { ResizeObserver } from 'resize-observer';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

    user: User;
    messages: Message[] = [];

    messageDisplayQuantity: number = 1;
    messagePages: number = 1;
    messageCurrentPage: number = 1;

    // resize observer to change the quantity of displayed items depending upon the size.
    resizeObserver: ResizeObserver;
    resizeElement: HTMLElement;

    constructor(
        private http: HttpClient,
        private auth: AuthenticationService,
        private messageService: MessagesService,
        private el: ElementRef
    ) { }

    ngOnInit(): void {
        // get the user...
        this.auth.user.subscribe((user: User) => this.user = user );
        this.messageService.messagesObservable.subscribe((messages: Message[]) => { this.messages = messages; });
        // trigger a message update
        this.messageService.getMessages();
        this.observeSimulationSizeChange();
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

    /**
     * Gets the message that apply tot his page
     * @returns
     */
    getPageMessages(): Message[] {
        const lower: number = (this.messageCurrentPage - 1) * this.messageDisplayQuantity;
        const upper: number = this.messageCurrentPage * this.messageDisplayQuantity;
        return this.messages.filter((temp: Message, index: number) => index >= lower && index < upper);
    }

    observeSimulationSizeChange(callback?: Function): void {
        try {
            this.resizeElement =  document.getElementById('messages') as HTMLElement;

            this.resizeObserver = new ResizeObserver(() => {
                const containerHeight: number = this.resizeElement.offsetParent?.clientHeight || 0;
                const messageQuantity: number = Math.round(containerHeight / 80);

                this.messageDisplayQuantity = messageQuantity;
                this.messagePages = Math.ceil(this.messages.length / this.messageDisplayQuantity)
            });

            this.resizeObserver.observe(this.resizeElement);
            if (callback) callback();
        }
        catch (error) {
            console.log("Size change algorithm corrupted - simulation will be small. Reload required.")
        }
    }

}
