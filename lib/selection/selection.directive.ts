import { Directive, ElementRef, HostListener } from '@angular/core';
import { SelectionRegister } from './selection-register.service';

@Directive({
    selector: '[selection]'
})
export class SelectionDirective {
    constructor(private selectionRegister: SelectionRegister, el: ElementRef) {
        console.log('SelectionDirective');
    }
}