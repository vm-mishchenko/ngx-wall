import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {PickOutService} from '../../../modules/pick-out/pick-out.service';
import {IBrickDefinition} from '../../model/interfaces/brick-definition.interface';
import {IWallModel} from '../../model/interfaces/wall-model.interface';
import {BrickRegistry} from '../../registry/brick-registry.service';
import {IWallUiApi} from './interfaces/ui-api.interface';
import {IFocusContext} from './interfaces/wall-component/wall-component-focus-context.interface';

export type IWallViewPlan = IViewBrickDefinition[];

export interface IViewBrickDefinition {
    brick: IBrickDefinition;
    component: any; // UI component
}

export enum VIEW_MODE {
    EDIT = 'EDIT',
    NAVIGATION = 'NAVIGATION',
}

class ReactiveProperty<T> {
    readonly value$: Observable<T>;
    value: T;

    constructor(initialValue: T) {
        this.value = initialValue;
        this.value$ = new BehaviorSubject(initialValue);

    }

    next(value: T) {
        this.value = value;
        (this.value$ as BehaviorSubject<T>).next(value);
    }
}

export class NavigationMode {
    name = VIEW_MODE.NAVIGATION;
    private cursorPositionInternal$: BehaviorSubject<string> = new BehaviorSubject(null);
    cursorPosition: string;
    cursorPosition$ = this.cursorPositionInternal$.asObservable();
    selectedBricks: ReactiveProperty<string[]> = new ReactiveProperty([]);

    constructor(private wallViewModel: WallViewModel) {
    }

    setCursorTo(brickId: string) {
        this.cursorPositionInternal$.next(brickId);
    }

    moveCursorToPreviousBrick() {
        const currentCursor = this.cursorPositionInternal$.getValue();
        const previousBrickId = this.wallViewModel.wallModel.api.core2.getPreviousBrickId(currentCursor);

        if (previousBrickId) {
            this.cursorPosition = previousBrickId;
            this.cursorPositionInternal$.next(previousBrickId);
        }
    }

    moveCursorToNextBrick() {
        const currentCursor = this.cursorPositionInternal$.getValue();
        const nextBrickId = this.wallViewModel.wallModel.api.core2.getNextBrickId(currentCursor);

        if (nextBrickId) {
            this.cursorPosition = nextBrickId;
            this.cursorPositionInternal$.next(nextBrickId);
        }
    }

    primaryAction() {
        this.wallViewModel.callBrickPrimaryAction(this.cursorPositionInternal$.getValue());
    }

    // SELECTION
    selectBrick(brickId: string): void {
        this.selectedBricks.next([brickId]);
    }

    selectBricks(brickIds: string[]) {
        if (JSON.stringify(brickIds) !== JSON.stringify(this.selectedBricks.value)) {
            this.selectedBricks.next(this.wallViewModel.wallModel.api.core2.sortBrickIdsByLayoutOrder(brickIds));
        }
    }

    addBrickToSelection(brickId: string): void {
        const selectedBrickIds = this.selectedBricks.value.slice(0);

        selectedBrickIds.push(brickId);

        this.selectedBricks.next(this.wallViewModel.wallModel.api.core2.sortBrickIdsByLayoutOrder(selectedBrickIds));
    }

    removeBrickFromSelection(brickId: string): void {
        const brickIdIndex = this.selectedBricks.value.indexOf(brickId);

        this.selectedBricks.value.splice(brickIdIndex, 1);

        this.selectedBricks.next(this.selectedBricks.value.slice(0));
    }

    unSelectBricks(): void {
        this.selectedBricks.next([]);
    }

    /**
     * @public-api
     */
    getSelectedBrickIds(): string[] {
        return this.selectedBricks.value;
    }
}

export class EditMode {
    name = VIEW_MODE.EDIT;

    focusedBrick: ReactiveProperty<{
        id: string,
        context: any
    }> = new ReactiveProperty({
        id: null,
        context: null
    });

    constructor(private wallViewModel: WallViewModel) {
    }

    focusOnBrickId(brickId: string, focusContext?: IFocusContext) {
        console.log('focusOnBrickId');

        this.focusedBrick.next({
            id: brickId,
            context: focusContext,
        });
    }

    focusOnNextTextBrick(brickId: string, focusContext?: IFocusContext) {
        const nextTextBrickId = this.wallViewModel.wallModel.api.core2.getNextTextBrickId(brickId);

        if (nextTextBrickId) {
            this.focusOnBrickId(nextTextBrickId, focusContext);
        }
    }

    focusOnPreviousTextBrick(brickId: string, focusContext?: IFocusContext) {
        const previousTextBrickId = this.wallViewModel.wallModel.api.core2.getPreviousTextBrickId(brickId);

        if (previousTextBrickId) {
            this.focusOnBrickId(previousTextBrickId, focusContext);
        }
    }
}

export class Mode {
    private currentModeInternal$: BehaviorSubject<VIEW_MODE> = new BehaviorSubject(VIEW_MODE.EDIT);
    currentMode$: Observable<VIEW_MODE> = this.currentModeInternal$.asObservable();

    edit: EditMode = new EditMode(this.wallViewModel);
    navigation: NavigationMode = new NavigationMode(this.wallViewModel);

    constructor(private wallViewModel: WallViewModel) {
    }

    switchMode() {
        const currentMode = this.currentModeInternal$.getValue();

        if (currentMode === VIEW_MODE.EDIT) {
            this.switchModeTo(VIEW_MODE.NAVIGATION);
        } else {
            this.switchModeTo(VIEW_MODE.EDIT);
        }
    }

    switchModeTo(mode: VIEW_MODE) {
        const currentMode = this.currentModeInternal$.getValue();

        if (mode === VIEW_MODE.EDIT && currentMode !== VIEW_MODE.EDIT) {
            this.switchToEditMode();
        }

        if (mode === VIEW_MODE.NAVIGATION && currentMode !== VIEW_MODE.NAVIGATION) {
            this.switchToNavigationMode();
        }
    }

    private switchToEditMode() {
        const focusToBrick = this.navigation.cursorPosition ||
            this.wallViewModel.wallModel.api.core2.query().brickIdBasedOnPosition(0);

        this.navigation.unSelectBricks();
        this.edit.focusOnBrickId(focusToBrick);

        this.currentModeInternal$.next(VIEW_MODE.EDIT);
    }

    private switchToNavigationMode() {
        (document.activeElement as HTMLElement).blur();

        let cursorPosition;
        const focusedBrick = this.edit.focusedBrick;

        if (focusedBrick.value.id) {
            cursorPosition = focusedBrick.value.id;
        } else {
            cursorPosition = this.wallViewModel.wallModel.api.core2.query().brickIdBasedOnPosition(0);
        }

        if (cursorPosition) {
            this.navigation.setCursorTo(cursorPosition);
        }

        this.currentModeInternal$.next(VIEW_MODE.NAVIGATION);
    }
}

@Injectable()
export class WallViewModel implements IWallUiApi {
    wallModel: IWallModel = null;

    events: Subject<any> = new Subject();

    // UI
    isMediaInteractionEnabled$: Observable<boolean> = new BehaviorSubject(true);
    viewPlan$: Observable<IWallViewPlan>;
    mode: Mode;

    private wallModelSubscription: Subscription;

    constructor(private brickRegistry: BrickRegistry, private pickOutService: PickOutService) {
    }

    callBrickPrimaryAction(brickId: string) {
        console.log(`primary action for ${brickId}`);
        this.mode.switchMode();
    }

    // called by Wall component
    initialize(wallModel: IWallModel) {
        this.wallModel = wallModel;
        this.mode = new Mode(this);

        // initialize view core API
        const coreApi = [
            // MODES
            'mode',

            // BEHAVIOUR
            'enableMediaInteraction',
            'disableMediaInteraction',

            // EXECUTION
            'callBrickPrimaryAction',
        ].reduce((result, methodName) => {
            if (this[methodName].bind) {
                result[methodName] = this[methodName].bind(this);
            } else {
                result[methodName] = this[methodName];
            }

            return result;
        }, {});

        // protect API from extending
        Object.seal(coreApi);

        // register methods on model itself
        this.wallModel.registerApi('ui', coreApi);

        // todo-refactoring: fix subscription
        this.wallModelSubscription = this.wallModel.api.core2.events$.subscribe((event) => {
            // todo: event changes should have more friendly API,
            // replace from array to some custom class
            if (event.changes.turned && event.changes.turned.length) {
                // wait till component will be rendered
                // todo: ideally we have to wait (using observable) rendering process
                // and focus on brick
                setTimeout(() => {
                    this.mode.edit.focusOnBrickId(event.changes.turned[0].brickId);
                });
            }

            if (event.changes.moved.length) {
                this.mode.navigation.unSelectBricks();
            }
        });

        // brick was removed
        this.wallModel.api.core2.events$.pipe(
            filter((event) => {
                return Boolean(event.changes.removed.length);
            })
        ).subscribe(() => {
            this.mode.switchModeTo(VIEW_MODE.EDIT);

            if (!this.wallModel.api.core2.query().length()) {
                const {id} = this.wallModel.api.core2.addDefaultBrick();

                this.mode.edit.focusOnBrickId(id);
            }
        });


        this.viewPlan$ = this.wallModel.api.core2.plan$.pipe(
            map((plan) => {
                const viewPlan = plan.map((brick) => {
                    return {
                        brick,
                        component: this.brickRegistry.get(brick.tag).component
                    };
                });

                return viewPlan;
            })
        );

        // disable pick out functionality in read-only mode
        this.wallModel.api.core2.isReadOnly$.subscribe((isReadOnly) => {
            if (isReadOnly) {
                this.pickOutService.disablePickOut();
            } else {
                this.pickOutService.enablePickOut();
            }
        });
    }

    /**
     * @public-api
     */
    enableMediaInteraction() {
        (this.isMediaInteractionEnabled$ as BehaviorSubject<boolean>).next(true);
    }

    /**
     * @public-api
     */
    disableMediaInteraction() {
        (this.isMediaInteractionEnabled$ as BehaviorSubject<boolean>).next(false);
    }

    onCanvasClick() {
        const lastBrick = this.wallModel.api.core2.query().lastBrick();

        if (lastBrick && lastBrick.tag === 'text' && !lastBrick.data.text) {
            this.mode.edit.focusOnBrickId(lastBrick.id);
            return;
        }

        const {id} = this.wallModel.api.core2.addDefaultBrick();

        setTimeout(() => {
            this.mode.edit.focusOnBrickId(id);
        });
    }

    // canvas interaction
    onBrickStateChanged(brickId: string, brickState: any): void {
        this.wallModel.api.core2.updateBrickState(brickId, brickState);
    }

    reset() {
        this.wallModelSubscription.unsubscribe();

        this.wallModelSubscription = null;

        this.mode.navigation.unSelectBricks();
    }
}
