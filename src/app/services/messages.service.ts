import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, take, tap } from 'rxjs';

export interface Message {
    content: string;
    time: number;
    type: number;
    title: string;
    _id: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService implements OnDestroy {

    messagesObservable = new BehaviorSubject<Message[]>([]);
    messages: Message[] = [];

    messagesSub: Subscription;

    constructor(
        private http: HttpClient
    ) { }

    ngOnDestroy(): void {
        this.messagesSub.unsubscribe();
    }

  /**
     * Retrives the messages from the database...
     */
    getMessages(): void {
        this.messagesSub = this.http
        .get<{ data: Message[], success: boolean }>('http://localhost:3000/api/messages/all')
        .subscribe({
            next: (result: { data: Message[], success: boolean }) => {
                this.messages = [...result.data];
                this.pushNewMessages([...this.messages]);
            },
            error: (error: any) => {
                console.log(`Error retrieving messages: ${error}`);
            }
        })
    }

    /**
     * Add a message onto the message string...
     * @param message
     */
    addMessage(message: Message[]): void {
        message.forEach((newMessage: Message) => this.messages.push({...newMessage}));
        this.pushNewMessages([...this.messages]);
    }

    /**
     * Performs any last operations on the new messages to push and pushes them.
     * (a) Sort into time order.
     * @param messages
     */
    pushNewMessages(messages: Message[]): void {
        const sortedMessages = messages.sort((a: Message, b: Message) => b.time - a.time);
        this.messagesObservable.next([...sortedMessages]);
    }

    /**
     * Removes a message from the database.
     * @param messageId
     */
    dismissMessage(messageId: string): Observable<boolean> {
        return this.http
        .delete<boolean>('http://localhost:3000/api/messages/delete/'+messageId)
        .pipe(take(1), tap({
            next: (result: any) => {
                // put a delay on set interval so that the animation can occur on the item.
                setTimeout(() => {
                    this.messages = [...this.messages.filter((temp: Message) => messageId !== temp._id)];
                    this.pushNewMessages([...this.messages]);
                }, 500)
            }
        }))
    }
}
