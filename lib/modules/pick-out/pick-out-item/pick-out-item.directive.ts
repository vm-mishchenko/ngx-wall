import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PickOutCoordinator } from '../pick-out-coordinator.service';
import { windowToken } from '../pick-out.tokens';

@Directive({
    selector: '[pick-out-item]'
})
export class PickOutItemDirective implements OnInit, OnDestroy {
    @Input('pick-out-item') id;

    private window;

    constructor(private pickOutCoordinator: PickOutCoordinator,
                @Inject(windowToken) private windowReference: any,
                private el: ElementRef) {
        this.window = windowReference;
    }

    ngOnInit() {
        this.pickOutCoordinator.registerPickOutItem({
            id: this.id,
            api: {
                getPosition: this.getPosition.bind(this)
            }
        });
    }

    ngOnDestroy() {
        this.pickOutCoordinator.unRegisterPickOutItem(this.id);
    }

    private getPosition() {
        const offsets = this.el.nativeElement.getBoundingClientRect();

        return {
            x: offsets.left + this.window.pageXOffset,
            y: offsets.top + this.window.pageYOffset,
            width: this.el.nativeElement.offsetWidth,
            height: this.el.nativeElement.offsetHeight
        };
    }
}
