import { Directive, ElementRef, Inject, Input, OnDestroy } from '@angular/core';
import { WindowReference } from "../radar.tokens";
import { RadarCoordinator } from "../radar-coordinator.service";

@Directive({selector: '[spot]'})
export class SpotDirective implements OnDestroy {
    @Input('spot') data: any = null;

    private window: any;

    constructor(private radarCoordinator: RadarCoordinator,
                private el: ElementRef,
                @Inject(WindowReference) private _window: any) {
        this.radarCoordinator.register(this);

        this.window = _window;
    }

    ngOnDestroy() {
        this.radarCoordinator.unRegister(this);
    }

    // disadvantage of public 'getPosition' method instead of regestering public api
    // in radarCoordinate that host component could get spot instance and call all public methods
    getPosition() {
        const offsets = this.el.nativeElement.getBoundingClientRect();

        return {
            x: offsets.left + this.window.pageXOffset,
            y: offsets.top + this.window.pageYOffset,
            width: this.el.nativeElement.offsetWidth,
            height: this.el.nativeElement.offsetHeight
        };
    }
}