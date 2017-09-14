import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { PickOutHandlerService } from '../pick-out-handler.service';

@Directive({
    selector: '[pick-out-item]'
})
export class PickOutItemDirective implements OnInit {
    @Input('pick-out-item') id;

    constructor(private pickOutHandlerService: PickOutHandlerService,
                private el: ElementRef) {
    }

    ngOnInit() {
        // wait until all style will be apply
        // TODO: check this unclear behaviour
        setTimeout(() => {
            const offsets = this.el.nativeElement.getBoundingClientRect();

            this.pickOutHandlerService.registerPickOutItem({
                id: this.id,
                x: offsets.left,
                y: offsets.top,
                width: this.el.nativeElement.offsetWidth,
                height: this.el.nativeElement.offsetHeight
            });
        })
    }
}
