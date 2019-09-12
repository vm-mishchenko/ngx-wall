import {
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    Injector,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {Subscription} from 'rxjs';
import {LocationUpdatedEvent} from '../../../../../modules/radar/events/location-updated.event';
import {Radar} from '../../../../../modules/radar/radar.service';
import {IWallComponent} from '../../../wall/interfaces/wall-component/wall-component.interface';
import {IViewBrickDefinition} from '../../../wall/wall-view.model';
import {WallCanvasComponent} from '../../wall-canvas.component';

@Component({
    selector: 'wall-canvas-brick',
    templateUrl: './wall-canvas-brick.component.html',
    styleUrls: ['./wall-canvas-brick.component.scss']
})
export class WallCanvasBrickComponent implements OnInit, OnDestroy, OnChanges {
    // todo add type
    @Input() viewBrick: IViewBrickDefinition;

    @ViewChild('brickContainer', {read: ViewContainerRef}) container: ViewContainerRef;

    selected = false;

    isMouseNear = false;

    spot: any;

    isMediaInteractionEnabled = true;

    private componentReference: ComponentRef<any>;

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
                private cdRef: ChangeDetectorRef,
                private wallCanvasComponent: WallCanvasComponent) {
    }

    ngOnInit() {
        this.spot = {
            brickId: this.viewBrick.brick.id,
            isPickOutItem: true,
            isBeacon: true
        };

        this.componentReference = this.renderBrick();

        // show/hide drag-and-drop handler
        this.radarSubscription = this.radar.subscribe((e) => {
            if (e instanceof LocationUpdatedEvent) {
                // always hide when model is readonly state
                if (this.wallCanvasComponent.wallModel.api.core2.isReadOnly) {
                    this.isMouseNear = false;
                } else {
                    // show/hide based on distance to the handler
                    const currentSpot = e.spots.find((spot) => spot.data.brickId === this.viewBrick.brick.id);

                    if (currentSpot.isCross13Line) {
                        this.isMouseNear = currentSpot.topLeftPointDistance < this.minimalDistanceToMouse;
                    } else {
                        this.isMouseNear = false;
                    }
                }

                this.cdRef.detectChanges();
            }
        });

        this.focusedBrickSubscription = this.wallCanvasComponent.focusedBrick$.subscribe((focusedBrick) => {
            if (focusedBrick.id === this.viewBrick.brick.id) {
                this.callInstanceApi('onWallFocus', focusedBrick.context);
            }
        });

        this.selectedBricksSubscription = this.wallCanvasComponent.selectedBricks$.subscribe((selectedBricks) => {
            this.selected = !Boolean(selectedBricks.indexOf(this.viewBrick.brick.id) === -1);
        });

        this.isMediaInteractionEnabledSubscription = this.wallCanvasComponent.isMediaInteractionEnabled$
            .subscribe((isMediaInteractionEnabled) => this.isMediaInteractionEnabled = isMediaInteractionEnabled);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.viewBrick && !changes.viewBrick.firstChange && changes.viewBrick.currentValue) {
            this.componentReference.instance.state = this.viewBrick.brick.data;

            this.callInstanceApi('onWallStateChange', this.componentReference.instance.state);
        }
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

    private callInstanceApi(methodName: string, data?: any) {
        if (this.componentReference.instance[methodName]) {
            this.componentReference.instance[methodName](data);
        }
    }

    private renderBrick() {
        const factory = this.resolver.resolveComponentFactory(this.viewBrick.component);

        const componentReference = this.container.createComponent(factory, null, this.injector);

        const componentInstance = componentReference.instance as IWallComponent;

        componentInstance.id = this.viewBrick.brick.id;
        componentInstance.state = this.viewBrick.brick.data;
        componentInstance.wallModel = this.wallCanvasComponent.wallModel;

        if (componentInstance.stateChanges) {
            this.stateChangesSubscription = componentInstance.stateChanges.subscribe((newState) => {
                this.wallCanvasComponent.brickStateChanged(this.viewBrick.brick.id, newState);
            });
        }

        return componentReference;
    }

    private initializeDrag() {

    }

    private stopDrag() {
    }
}
