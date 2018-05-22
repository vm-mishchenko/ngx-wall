import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';

@Component({
    template: `<span [ngClass]="customClassName"></span>`
})
export class ResizableHandlerComponent {
    @Input() customClassName: string;
    @Output() mouseDownEvent: EventEmitter<MouseEvent> = new EventEmitter();

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        this.mouseDownEvent.emit(event);
    }
}
