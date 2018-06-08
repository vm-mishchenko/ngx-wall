import {Directive, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {ISpotInfo, ISpotPosition, ISpotSize} from '../interfaces/distance-to-spot.interface';
import {SpotId} from '../interfaces/spot-id.type';
import {RadarCoordinator} from '../radar-coordinator.service';

@Directive({
    selector: '[spot]'
})
export class SpotDirective implements OnInit, OnDestroy {
    @Input() spot: any;

    id: SpotId = String(Math.random());

    constructor(private radarCoordinator: RadarCoordinator,
                private el: ElementRef) {
    }

    ngOnInit() {
        this.radarCoordinator.register(this.id, this);
    }

    getInfo(): ISpotInfo {
        return {
            id: this.id,
            data: this.getData(),
            size: this.getSize(),
            position: this.getPosition()
        };
    }

    getData(): any {
        return this.spot;
    }

    getSize(): ISpotSize {
        return {
            width: this.el.nativeElement.offsetWidth,
            height: this.el.nativeElement.offsetHeight
        };
    }

    getPosition(): ISpotPosition {
        const offsets = this.el.nativeElement.getBoundingClientRect();

        return {
            x: offsets.left,
            y: offsets.top
        };
    }

    ngOnDestroy() {
        this.radarCoordinator.unRegister(this.id);
    }
}
