import {Directive, ElementRef, HostListener, Input, OnInit, Renderer2} from '@angular/core';
import {TowCoordinator} from '../tow-coordinator.service';

@Directive({selector: '[tow-slave]'})
export class TowSlaveDirective implements OnInit {
    @Input('tow-slave') id;

    @HostListener('dragstart', ['$event'])
    dragStart(event: DragEvent) {
        // event.preventDefault();

        event.dataTransfer.setDragImage(this.el.nativeElement.parentElement.children[2], 0, 0);

        this.towCoordinator.slaveStartWorking(this.id);
    }

    @HostListener('dragend', ['$event'])
    dragEnd(event) {
        this.towCoordinator.slaveStopWorking(this.id);
    }

    constructor(private renderer2: Renderer2,
                private el: ElementRef,
                private towCoordinator: TowCoordinator) {
    }

    ngOnInit() {
        this.renderer2.setAttribute(this.el.nativeElement, 'draggable', 'true');
    }
}