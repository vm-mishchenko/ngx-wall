import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { SelectionRegister } from './selection-register.service';

@Directive({
    selector: '[selection-item]'
})
export class SelectionItemDirective implements OnInit {
    @Input('selection-item') id;

    constructor(private selectionRegister: SelectionRegister, private el: ElementRef) {
    }

    ngOnInit() {
        const offsets = this.el.nativeElement.getBoundingClientRect();

        this.selectionRegister.registerSelectionItem({
            id: this.id,
            x: offsets.left,
            y: offsets.top,
            width: this.el.nativeElement.offsetWidth,
            height: this.el.nativeElement.offsetHeight
        });
    }
}
