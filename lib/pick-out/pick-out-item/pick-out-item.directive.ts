import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PickOutHandlerService } from '../pick-out-handler.service';
import { DOCUMENT } from '@angular/common';
import { Window } from '../pick-out.tokens';

@Directive({
    selector: '[pick-out-item]'
})
export class PickOutItemDirective implements OnInit, OnDestroy {
    @Input('pick-out-item') id;

    private doc;

    private window;

    constructor(private pickOutHandlerService: PickOutHandlerService,
                @Inject(DOCUMENT) doc,
                @Inject(Window) private _window: any,
                private el: ElementRef) {
        this.doc = doc;
        this.window = _window;
    }

    ngOnInit() {
        // wait until all style will be apply
        // TODO: check this unclear behaviour
        setTimeout(() => {
            const offsets = this.el.nativeElement.getBoundingClientRect();

            /*const d = this.doc.createElement('DIV');
            d.innerText =offsets.top + this.window.pageYOffset

            this.el.nativeElement.appendChild(d);*/

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
