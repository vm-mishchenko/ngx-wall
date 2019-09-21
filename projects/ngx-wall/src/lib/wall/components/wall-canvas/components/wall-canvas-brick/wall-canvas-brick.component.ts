import {
    AfterViewInit,
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
import {BehaviorSubject, combineLatest, Observable, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, map, takeUntil} from 'rxjs/operators';
import {Radar} from '../../../../../modules/radar/radar.service';
import {IWallUiApi} from '../../../wall/interfaces/ui-api.interface';
import {IWallComponent} from '../../../wall/interfaces/wall-component/wall-component.interface';
import {IViewBrickDefinition, VIEW_MODE} from '../../../wall/wall-view.model';
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

    uiApi: IWallUiApi = this.wallCanvasComponent.wallViewModel.wallModel.api.ui;

    isBrickSelected$: Observable<boolean> = combineLatest(
        this.uiApi.mode.currentMode$,
        this.uiApi.mode.navigation.selectedBricks$,
    )
        .pipe(
            map(([currentMode, selectedBricks]) => {
                return currentMode === VIEW_MODE.NAVIGATION && !Boolean(selectedBricks.indexOf(this.viewBrick.brick.id) === -1);
            })
        );

    hasNavigationCursor$: Observable<boolean> = combineLatest(
        this.uiApi.mode.currentMode$,
        this.uiApi.mode.navigation.cursorPosition$
    ).pipe(
        map(([currentMode, cursorPosition]) => {
            return currentMode === VIEW_MODE.NAVIGATION && cursorPosition === this.viewBrick.brick.id;
        })
    );

    private isShowDraggableHandlerInternal$ = new BehaviorSubject(false);
    isShowDraggableHandler$ = this.isShowDraggableHandlerInternal$.asObservable().pipe(
        distinctUntilChanged()
    );

    spotData: {
        brickId: string,
        isPickOutItem: boolean,
        isBeacon: boolean
    };

    private componentReference: ComponentRef<any>;

    private stateChangesSubscription: Subscription;

    private destroyed$ = new Subject<boolean>();

    constructor(private injector: Injector,
                private resolver: ComponentFactoryResolver,
                private radar: Radar,
                readonly wallCanvasComponent: WallCanvasComponent) {
    }

    ngOnInit() {
        this.spotData = {
            brickId: this.viewBrick.brick.id,
            isPickOutItem: true,
            isBeacon: true
        };

        this.componentReference = this.renderBrick();

        this.wallCanvasComponent.wallViewModel
            .brickComponentsStorage
            .register(this.viewBrick.brick.id, this.componentReference);
    }

    // wait until child spot directive will be initialized
    ngAfterViewInit() {
        // show/hide drag-and-drop handler
        const spot = this.radar.spots.get(this.viewBrick.brick.id);

        combineLatest(
            spot.onIsMouseCross13Line(),
            spot.onIsMouseTopLeftDistanceLessThan(MINIMAL_DISTANCE_TO_MOUSE)
        ).pipe(
            takeUntil(this.destroyed$),
            map(([isCross13Line, isTopLeftDistanceLessThan]) => {
                return isCross13Line &&
                    isTopLeftDistanceLessThan &&
                    !this.wallCanvasComponent.wallViewModel.wallModel.api.core2.isReadOnly;
            }),
            distinctUntilChanged()
        ).subscribe((isShowDraggableHandler) => {
            this.isShowDraggableHandlerInternal$.next(isShowDraggableHandler);
        });
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

        this.wallCanvasComponent.wallViewModel
            .brickComponentsStorage
            .unRegister(this.viewBrick.brick.id);

        this.destroyed$.next();
    }

    /** User selects the brick. */
    onBrickClick() {
        this.wallCanvasComponent.wallViewModel.mode.edit.setFocusedBrickId(this.viewBrick.brick.id);
    }

    private callInstanceApi(methodName: string, data?: any) {
        if (this.componentReference.instance[methodName]) {
            this.componentReference.instance[methodName](data);
        }
    }

    private renderBrick() {
        const factory = this.resolver.resolveComponentFactory(this.viewBrick.component);

        const componentRef = this.container.createComponent(factory, null, this.injector);

        const componentInstance = componentRef.instance as IWallComponent;

        componentInstance.id = this.viewBrick.brick.id;
        componentInstance.state = this.viewBrick.brick.data;
        componentInstance.wallModel = this.wallCanvasComponent.wallViewModel.wallModel;

        if (componentInstance.stateChanges) {
            this.stateChangesSubscription = componentInstance.stateChanges.subscribe((newState) => {
                this.wallCanvasComponent.brickStateChanged(this.viewBrick.brick.id, newState);
            });
        }

        return componentRef;
    }
}
