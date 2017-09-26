import {Directive, ElementRef, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {PickOutHandlerService} from '../pick-out-handler.service';
import {WindowReference} from '../pick-out.tokens';

@Directive({
    selector: '[pick-out-item]'
})
export class PickOutItemDirective implements OnInit, OnDestroy {
    @Input('pick-out-item') id;

    private window;

    constructor(private pickOutHandlerService: PickOutHandlerService,
                @Inject(WindowReference) private _window: any,
                private el: ElementRef) {
        this.window = _window;
    }

    ngOnInit() {
        this.pickOutHandlerService.registerPickOutItem({
            id: this.id,
            api: {
                getPosition: this.getPosition.bind(this)
            }
        });
    }

    ngOnDestroy() {
        this.pickOutHandlerService.unRegisterPickOutItem(this.id);
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
