import {Directive, ElementRef, HostListener, Input, OnInit, Renderer2} from '@angular/core';
import {TowCoordinator} from '../tow-coordinator.service';

// Notify Tow Coordinator about drag operation
@Directive({selector: '[tow-slave]'})
export class TowSlaveDirective implements OnInit {
    @Input('tow-slave') id;

    constructor(private renderer2: Renderer2,
                private el: ElementRef,
                private towCoordinator: TowCoordinator) {
    }

    @HostListener('dragstart', ['$event'])
    dragStart(event: DragEvent) {
        event.dataTransfer.dropEffect = 'move';

        event.dataTransfer.setData('FAKE', JSON.stringify({}));

        this.towCoordinator.slaveStartWorking(this.id);
    }

    @HostListener('drag', ['$event'])
    drag(event: DragEvent) {
        event.dataTransfer.dropEffect = 'move';
    }

    @HostListener('dragend', ['$event'])
    dragEnd(e) {
        e.preventDefault();
        e.stopPropagation();

        this.towCoordinator.slaveStopWorking(this.id);
    }

    ngOnInit() {
        this.renderer2.setAttribute(this.el.nativeElement, 'draggable', 'true');
    }
}
