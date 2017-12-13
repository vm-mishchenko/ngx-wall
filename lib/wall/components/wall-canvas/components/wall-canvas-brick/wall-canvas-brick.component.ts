import {
    Component, ComponentFactoryResolver, ComponentRef, Injector, Input, OnDestroy, OnInit, ViewChild,
    ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { LocationUpdatedEvent, Radar } from '../../../../../modules/radar';
import { IWallComponent } from '../../../../wall.interfaces';
import { WallCanvasComponent } from '../../wall-canvas.component';

@Component({
    selector: 'wall-canvas-brick',
    templateUrl: './wall-canvas-brick.component.html'
})
export class WallCanvasBrickComponent implements OnInit, OnDestroy {
    // todo add type
    @Input() brick: any;

    @ViewChild('brickContainer', {read: ViewContainerRef}) container: ViewContainerRef;

    private componentReference: ComponentRef<any>;

    private selected = false;

    private isMouseNear = false;

    private isMediaInteractionEnabled = true;

    private minimalDistanceToMouse = 100;

    // subscriptions
    private stateChangesSubscription: Subscription;
    private radarSubscription: Subscription;
    private focusedBrickSubscription: Subscription;
    private selectedBricksSubscription: Subscription;
    private isMediaInteractionEnabledSubscription: Subscription;

    constructor(private injector: Injector,
                private resolver: ComponentFactoryResolver,
                private radar: Radar,
                private wallCanvasComponent: WallCanvasComponent) {
    }

    ngOnInit() {
        this.componentReference = this.renderBrick();

        // todo maybe move it to model API?
        this.radarSubscription = this.radar.subscribe((e) => {
            if (e instanceof LocationUpdatedEvent) {
                const currentSpot = e.spots.find((spot) => {
                    return spot.data === this.brick.id;
                });

                if (currentSpot.isCross13Line) {
                    this.isMouseNear = currentSpot.topLeftPointDistance < this.minimalDistanceToMouse;
                } else {
                    this.isMouseNear = false;
                }
            }
        });

        this.focusedBrickSubscription = this.wallCanvasComponent.focusedBrick$.subscribe((focusedBrick) => {
            if (focusedBrick.id === this.brick.id) {
                this.callInstanceApi('onWallFocus', focusedBrick.context);
            }
        });

        this.selectedBricksSubscription = this.wallCanvasComponent.selectedBricks$.subscribe((selectedBricks) => {
            this.selected = !Boolean(selectedBricks.indexOf(this.brick.id) === -1);
        });

        this.isMediaInteractionEnabledSubscription = this.wallCanvasComponent.isMediaInteractionEnabled$
            .subscribe((isMediaInteractionEnabled) => this.isMediaInteractionEnabled = isMediaInteractionEnabled);
    }

    ngOnDestroy() {
        this.radarSubscription.unsubscribe();
        this.focusedBrickSubscription.unsubscribe();
        this.selectedBricksSubscription.unsubscribe();
        this.isMediaInteractionEnabledSubscription.unsubscribe();

        if (this.stateChangesSubscription) {
            this.stateChangesSubscription.unsubscribe();
        }
    }

    onFocused() {
        this.wallCanvasComponent.onFocused(this.brick.id);
    }

    private callInstanceApi(methodName: string, data?: any) {
        if (this.componentReference.instance[methodName]) {
            this.componentReference.instance[methodName](data);
        }
    }

    private renderBrick() {
        const factory = this.resolver.resolveComponentFactory(this.brick.component);

        const componentReference = this.container.createComponent(factory, null, this.injector);

        const componentInstance = componentReference.instance as IWallComponent;

        componentInstance.id = this.brick.id;
        componentInstance.state = this.brick.state;

        if (componentInstance.stateChanges) {
            this.stateChangesSubscription = componentInstance.stateChanges.subscribe((newState) => {
                this.wallCanvasComponent.brickStateChanged(this.brick.id, newState);
            });
        }

        return componentReference;
    }
}
