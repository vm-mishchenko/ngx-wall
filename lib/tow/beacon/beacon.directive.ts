import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { BeaconRegistry } from './beacon.registry.service';
import { WindowReference } from '../tow.tokens';

@Directive({selector: '[beacon]'})
export class BeaconDirective implements OnInit, OnDestroy {
    @Input('beacon') id;

    private window;

    constructor(private beaconRegistry: BeaconRegistry,
                private el: ElementRef,
                @Inject(WindowReference) private _window: any,) {
        this.window = _window;
    }

    ngOnInit() {
        this.beaconRegistry.register({
            id: this.id,
            api: {
                getPosition: this.getPosition.bind(this)
            }
        });
    }

    ngOnDestroy() {
        this.beaconRegistry.unRegister(this.id);
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