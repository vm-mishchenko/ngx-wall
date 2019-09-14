import {
    AfterViewInit,
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
import {combineLatest, Observable, Subject, Subscription} from 'rxjs';
import {map, takeUntil, tap} from 'rxjs/operators';
import {Radar} from '../../../../../modules/radar/radar.service';
import {IWallComponent} from '../../../wall/interfaces/wall-component/wall-component.interface';
import {IViewBrickDefinition} from '../../../wall/wall-view.model';
import {WallCanvasComponent} from '../../wall-canvas.component';

const MINIMAL_DISTANCE_TO_MOUSE = 100;

@Component({
    selector: 'wall-canvas-brick',
    templateUrl: './wall-canvas-brick.component.html',
    styleUrls: ['./wall-canvas-brick.component.scss']
})
export class WallCanvasBrickComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
    // todo add type
    @Input() viewBrick: IViewBrickDefinition;

    @ViewChild('brickContainer', {read: ViewContainerRef}) container: ViewContainerRef;

    isBrickSelected$: Observable<boolean> = this.wallCanvasComponent.selectedBricks$
        .pipe(
            map((selectedBricks) => {
                return !Boolean(selectedBricks.indexOf(this.viewBrick.brick.id) === -1);
            })
        );

    isShowDraggableHandler: Observable<boolean>;

    spotData: {
        brickId: string,
        isPickOutItem: boolean,
        isBeacon: boolean
    };

    isMediaInteractionEnabled$ = this.wallCanvasComponent.isMediaInteractionEnabled$;

    private componentReference: ComponentRef<any>;

    private stateChangesSubscription: Subscription;

    private destroyed$ = new Subject<boolean>();

    constructor(private injector: Injector,
                private resolver: ComponentFactoryResolver,
                private radar: Radar,
                private cdRef: ChangeDetectorRef,
                private wallCanvasComponent: WallCanvasComponent) {
    }

    ngOnInit() {
        this.spotData = {
            brickId: this.viewBrick.brick.id,
            isPickOutItem: true,
            isBeacon: true
        };

        this.componentReference = this.renderBrick();

        this.wallCanvasComponent.focusedBrick$
            .pipe(
                takeUntil(this.destroyed$)
            )
            .subscribe((focusedBrick) => {
                if (focusedBrick.id === this.viewBrick.brick.id) {
                    this.callInstanceApi('onWallFocus', focusedBrick.context);
                }
        });
    }

    // wait until child spot directive will be initialized
    ngAfterViewInit() {
        // show/hide drag-and-drop handler
        const spot = this.radar.spots.get(this.viewBrick.brick.id);

        this.isShowDraggableHandler = combineLatest(
            spot.onIsMouseCross13Line(),
            spot.onIsMouseTopLeftDistanceLessThan(MINIMAL_DISTANCE_TO_MOUSE)
        ).pipe(
            map(([isCross13Line, isTopLeftDistanceLessThan]) => {
                return isCross13Line &&
                    isTopLeftDistanceLessThan &&
                    !this.wallCanvasComponent.wallModel.api.core2.isReadOnly;
            }),
            tap(() => {
                this.cdRef.detectChanges();
            })
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.viewBrick && !changes.viewBrick.firstChange && changes.viewBrick.currentValue) {
            this.componentReference.instance.state = this.viewBrick.brick.data;

            this.callInstanceApi('onWallStateChange', this.componentReference.instance.state);
        }
    }

    ngOnDestroy() {
        if (this.stateChangesSubscription) {
            this.stateChangesSubscription.unsubscribe();
        }

        this.destroyed$.next();
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
}
