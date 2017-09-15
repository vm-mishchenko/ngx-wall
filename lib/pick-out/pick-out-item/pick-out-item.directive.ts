import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PickOutHandlerService } from '../pick-out-handler.service';
import { WindowReference } from '../pick-out.tokens';

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
        // wait until all style will be apply
        // TODO: check this unclear behaviour
        setTimeout(() => {
            const offsets = this.el.nativeElement.getBoundingClientRect();

            this.pickOutHandlerService.registerPickOutItem({
                id: this.id,
                x: offsets.left + this.window.pageXOffset,
                y: offsets.top + this.window.pageYOffset,
                width: this.el.nativeElement.offsetWidth,
                height: this.el.nativeElement.offsetHeight
            });
        });
    }

    ngOnDestroy() {
        this.pickOutHandlerService.unRegisterPickOutItem(this.id);
    }
}
