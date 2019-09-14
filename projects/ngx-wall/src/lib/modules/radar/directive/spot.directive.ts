import {Directive, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {ISpotInfo, ISpotPosition} from '../interfaces/distance-to-spot.interface';
import {SpotId} from '../interfaces/spot-id.type';
import {RadarCoordinator} from '../radar-coordinator.service';

@Directive({
    selector: '[spot]'
})
export class SpotDirective implements OnInit, OnDestroy {
    // any data which client want to attach to the spot
    @Input() spotId: SpotId;
    @Input() spotData: any;

    constructor(private radarCoordinator: RadarCoordinator,
                private el: ElementRef) {
    }

    ngOnInit() {
        this.radarCoordinator.register(this.spotId, this);
    }

    /**
     * Return info about the element to which current spot is attached.
     * Called by
     *  1. Radar Coordinator during the mouse move event
     *  2. When client directly ask about spot information (through Radar Coordinator)
     */
    getInfo(): ISpotInfo {
        return {
            id: this.spotId,
            data: this.spotData,
            size: {
                width: this.el.nativeElement.offsetWidth,
                height: this.el.nativeElement.offsetHeight
            },
            position: this.position()
        };
    }

    ngOnDestroy() {
        this.radarCoordinator.unRegister(this.spotId);
    }

    private position(): ISpotPosition {
        const offsets = this.el.nativeElement.getBoundingClientRect();

        return {
            x: offsets.left,
            y: offsets.top
        };
    }
}
