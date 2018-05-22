import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'w-brick-input-placeholder',
    template: `
        <div class="w-brick-input-placeholder" (click)="onClick($event)">
            <span class="w-icon oi" [ngClass]="icon" aria-hidden="true"></span>
            <span> {{ text }} </span>
        </div>

        <w-loading-wrapper [message]="'Loading'" *ngIf="loading"></w-loading-wrapper>
    `,
    styles: [`
        :host {
            position: relative;
            display: block;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrickInputPlaceholderComponent implements OnInit {
    @Input() text: string;
    @Input() icon: string;
    @Input() loading: boolean;
    @Output() selected: EventEmitter<MouseEvent> = new EventEmitter();

    constructor() {
    }

    onClick(event: MouseEvent) {
        this.selected.emit(event);
    }

    ngOnInit() {
    }
}
