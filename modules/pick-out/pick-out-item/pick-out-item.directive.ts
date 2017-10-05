import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { WindowReference } from '../pick-out.tokens';
import { PickOutCoordinator } from "../pick-out-coordinator.service";

@Directive({
    selector: '[pick-out-item]'
})
export class PickOutItemDirective implements OnInit, OnDestroy {
    @Input('pick-out-item') id;

    private window;

    constructor(private pickOutCoordinator: PickOutCoordinator,
                @Inject(WindowReference) private _window: any,
                private el: ElementRef) {
        this.window = _window;
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
        }
    }
}
