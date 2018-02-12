import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'w-brick-input-placeholder',
    template: `
        <div class="w-brick-input-placeholder" (click)="onClick($event)">
            <span class="w-icon oi" [ngClass]="icon" aria-hidden="true"></span>
            <span>{{ text }}</span>
        </div>
    `
})
export class BrickInputPlaceholderComponent implements OnInit {
    @Input() text: string;
    @Input() icon: string;
    @Output() selected: EventEmitter<MouseEvent> = new EventEmitter();

    constructor() {
    }

    onClick(event: MouseEvent) {
        this.selected.emit(event);
    }

    ngOnInit() {
    }
}
