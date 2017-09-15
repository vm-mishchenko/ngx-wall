import { Directive, ElementRef, Inject, Input, OnInit } from '@angular/core';
import { BeaconRegistry } from './beacon.registry.service';
import { WindowReference } from '../tow.tokens';

@Directive({selector: '[beacon]'})
export class BeaconDirective implements OnInit {
    @Input('beacon') id;

    private window;

    constructor(private beaconRegistry: BeaconRegistry,
                private el: ElementRef,
                @Inject(WindowReference) private _window: any,) {
        this.window = _window;
    }

    ngOnInit() {
        setTimeout(() => {
            const offsets = this.el.nativeElement.getBoundingClientRect();

            this.beaconRegistry.register({
                id: this.id,
                x: offsets.left + this.window.pageXOffset,
                y: offsets.top + this.window.scrollY,
                width: this.el.nativeElement.offsetWidth,
                height: this.el.nativeElement.offsetHeight
            });
        });
    }
}