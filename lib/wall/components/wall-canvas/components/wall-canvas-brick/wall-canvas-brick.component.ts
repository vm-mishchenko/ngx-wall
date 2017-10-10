import {
    Component,
    ComponentFactoryResolver,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { WallCanvasApi } from '../../wall-canvas.api';
import { LocationUpdatedEvent, Radar } from "../../../../../../modules/radar";
import { Subscription } from "rxjs/Subscription";

@Component({
    selector: 'wall-canvas-brick',
    templateUrl: './wall-canvas-brick.component.html'
})
export class WallCanvasBrickComponent implements OnInit, OnDestroy {
    @Input() brick: any;

    @ViewChild('brickContainer', {read: ViewContainerRef}) container: ViewContainerRef;

    private selected: boolean = false;

    private isMouseNear: boolean = false;

    private minimalDistanceToMouse = 100;

    private radarSubscription: Subscription;

    constructor(private injector: Injector,
                private resolver: ComponentFactoryResolver,
                private radar: Radar,
                private wallCanvasApi: WallCanvasApi) {
    }

    ngOnInit() {
        const componentReference = this.renderBrick();

        this.wallCanvasApi.core.registerCanvasBrickInstance(this.brick.id, this, componentReference.instance);

        // todo maybe move it to model API?
        this.radarSubscription = this.radar.subscribe((e) => {
            if (e instanceof LocationUpdatedEvent) {
                const currentSpot = e.spots.find((spot) => {
                    return spot.data === this.brick.id;
                });

                if (currentSpot.isCross13Line) {
                    this.isMouseNear = currentSpot.topLeftPointDistance < this.minimalDistanceToMouse
                } else {
                    this.isMouseNear = false;
                }
            }
        });
    }

    ngOnDestroy() {
        this.radarSubscription.unsubscribe();
    }

    onFocused() {
        this.wallCanvasApi.core.onFocused(this.brick.id);
    }

    select() {
        this.selected = true;
    }

    unselect() {
        this.selected = false;
    }

    private renderBrick() {
        const factory = this.resolver.resolveComponentFactory(this.brick.component);

        const componentReference = this.container.createComponent(factory, null, this.injector);

        componentReference.instance['id'] = this.brick.id;

        return componentReference;
    }
}