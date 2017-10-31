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
import { LocationUpdatedEvent, Radar } from '../../../../../modules/radar';
import { Subscription } from 'rxjs/Subscription';
import { WallCanvasComponent } from '../../wall-canvas.component';

@Component({
    selector: 'wall-canvas-brick',
    templateUrl: './wall-canvas-brick.component.html'
})
export class WallCanvasBrickComponent implements OnInit, OnDestroy {
    @Input() brick: any;

    @ViewChild('brickContainer', {read: ViewContainerRef}) container: ViewContainerRef;

    private stateChangesSubscription: Subscription;

    private selected: boolean = false;

    private isMediaInteractionEnabled: boolean = true;

    private isMouseNear: boolean = false;

    private minimalDistanceToMouse = 100;

    private radarSubscription: Subscription;

    constructor(private injector: Injector,
                private resolver: ComponentFactoryResolver,
                private radar: Radar,
                private wallCanvasComponent: WallCanvasComponent,
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
        this.wallCanvasApi.core.removeCanvasBrickInstance(this.brick.id);

        this.radarSubscription.unsubscribe();

        if (this.stateChangesSubscription) {
            this.stateChangesSubscription.unsubscribe();
        }
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

    enableMediaInteraction() {
        this.isMediaInteractionEnabled = true;
    }

    disableMediaInteraction() {
        this.isMediaInteractionEnabled = false;
    }

    private renderBrick() {
        const factory = this.resolver.resolveComponentFactory(this.brick.component);

        const componentReference = this.container.createComponent(factory, null, this.injector);

        componentReference.instance['id'] = this.brick.id;
        componentReference.instance['state'] = this.brick.state;

        if (componentReference.instance['stateChanges']) {
            this.stateChangesSubscription = componentReference.instance['stateChanges'].subscribe((newState) => {
                this.wallCanvasComponent.brickStateChanged(this.brick.id, newState);
            });
        }

        return componentReference;
    }
}