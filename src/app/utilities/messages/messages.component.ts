import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { AuthenticationService, User } from 'src/app/services/authentication.service';
import { Message, MessagesService } from 'src/app/services/messages.service';
import { ResizeObserver } from 'resize-observer';

interface Types {
    type: number; style: string; icon: string; image: string; alt: string;
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, AfterViewInit {

    user: User;
    messages: Message[] = [];

    messageDisplayQuantity: number = 1;
    messagePages: number = 1;
    messageCurrentPage: number = 1;

    // resize observer to change the quantity of displayed items depending upon the size.
    resizeObserver: ResizeObserver;
    resizeElement: HTMLElement;

    // type images and colors
    // 0 - league was deleted
    // 1 - league restarted
    // 2 - you created a league
    // 11 - you win league
    // 12 - you are runner up of league
    // 20 - you left a league
    types: Types[] = [
        { type: 0, style: 'deleted', icon: 'trash.png', image: 'gold-trophy.png', alt: 'Winner!' },
        { type: 1, style: 'restarted', icon: 'cycle.png', image: 'gold-trophy.png', alt: 'Winner!' },
        { type: 2, style: 'created', icon: 'table2.png', image: 'gold-trophy.png', alt: 'Winner!' },
        { type: 11, style: 'won', icon: 'trophy-gold.png', image: 'gold-trophy.png', alt: 'Winner!' },
        { type: 12, style: 'runnerup', icon: 'trophy-silver.png', image: 'gold-trophy.png', alt: 'Runner Up!' },
        { type: 20, style: 'left', icon: 'exit.png', image: 'gold-trophy.png', alt: 'Winner!' }
    ]

    constructor(
        private auth: AuthenticationService,
        private messageService: MessagesService
    ) { }

    ngOnInit(): void {
        // get the user...
        this.auth.user.subscribe((user: User) => {
            this.user = user;
            if(user) {
                // once a user is loaded, get their messages...
                this.messageService.messagesObservable.subscribe((messages: Message[]) => {
                    this.messages = messages;
                    this.paginationRecalculation();
                });
                // trigger a message update
                this.messageService.getMessages().subscribe((messages: { data: Message[], success: boolean }) => {
                    // once the messages are returned observe the changes in the message size...
                    this.observeSimulationSizeChange();
                });
            }
        });
    }

    ngAfterViewInit(): void {
        this.observeSimulationSizeChange();
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
                this.paginationRecalculation();
            },
            error: (error: any) => {
                console.log(error);
            }
        })
    }

    // navigate the pages
    nextPage(): void { this.messageCurrentPage < this.messagePages && this.messageCurrentPage++; }
    lastPage(): void { this.messageCurrentPage > 1 &&  this.messageCurrentPage--; }
    firstPage(): void { this.messageCurrentPage = 1; }
    finalPage(): void { this.messageCurrentPage = this.messagePages; }

    /**
     * Gets the message that apply tot his page
     * @returns
     */
    getPageMessages(): Message[] {
        const lower: number = (this.messageCurrentPage - 1) * this.messageDisplayQuantity;
        const upper: number = this.messageCurrentPage * this.messageDisplayQuantity;
        return this.messages.filter((temp: Message, index: number) => index >= lower && index < upper);
    }

    /**
     * Set up an observer on the mesaages div to reclaucltae the posts that can be displayed.
     */
    observeSimulationSizeChange(): void {
        this.resizeElement =  document.getElementById('messages') as HTMLElement;
        this.resizeObserver = new ResizeObserver(() => {
            this.paginationRecalculation();
        });
        this.resizeObserver.observe(this.resizeElement);
    }

    /**
     * Recalculate the number of pages etc when the mesages array changes.
     */
    paginationRecalculation(): void {
        try {
            const containerHeight: number = this.resizeElement.offsetParent?.clientHeight || 0;
            const messageQuantity: number = Math.round(containerHeight / 80) - 1;
            this.messageDisplayQuantity = messageQuantity;
            this.messagePages = Math.ceil(this.messages.length / this.messageDisplayQuantity)

            // CHECK IF you are on the last page and nothing exists
            if(this.messageCurrentPage > this.messagePages) this.messageCurrentPage = this.messagePages || 1;
        } catch(e) {  }
    }


    /**
     * Get the Types object for the type selected.
     * @param typeId
     * @returns
     */
     getType(typeId: number): Types {
        return this.types.filter((temp: Types) => temp.type === typeId)[0];
    }
    // get type style
    getTypeStyle(typeId: number): string {
        const type: Types = this.getType(typeId);
        return type.style;
    }
    // get typ[e icon]
    getTypeIcon(typeId: number): string {
        const type: Types = this.getType(typeId);
        return type.icon;
    }
    // get type image
    getTypeImage(typeId: number): string {
        const type: Types = this.getType(typeId);
        return type.image;
    }
}
