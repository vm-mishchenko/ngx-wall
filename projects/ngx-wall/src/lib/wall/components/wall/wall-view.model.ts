import {ComponentRef, Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {filter, map, shareReplay} from 'rxjs/operators';
import {PickOutService} from '../../../modules/pick-out/pick-out.service';
import {IBrickDefinition} from '../../model/interfaces/brick-definition.interface';
import {IWallModel} from '../../model/interfaces/wall-model.interface';
import {ITransactionRemovedChange} from '../../plugins/core2/wall-core.plugin2';
import {BrickRegistry} from '../../registry/brick-registry.service';
import {IWallUiApi} from './interfaces/ui-api.interface';
import {IFocusContext} from './interfaces/wall-component/wall-component-focus-context.interface';


export const WALL_VIEW_API = 'ui';

export type IWallViewPlan = IViewBrickDefinition[];

export interface IViewBrickDefinition {
    brick: IBrickDefinition;
    component: any; // UI component
}

export enum VIEW_MODE {
    EDIT = 'EDIT',
    NAVIGATION = 'NAVIGATION',
}

export class NavigationMode {
    name = VIEW_MODE.NAVIGATION;

    private cursorPositionInternal$: BehaviorSubject<string> = new BehaviorSubject(null);
    get cursorPosition() {
        return this.cursorPositionInternal$.getValue();
    }
    cursorPosition$ = this.cursorPositionInternal$.asObservable();


    private selectedBricksInternal$: BehaviorSubject<string[]> = new BehaviorSubject([]);
    selectedBricks$ = this.selectedBricksInternal$.asObservable().pipe(
        shareReplay(1)
    );

    get selectedBricks() {
        return this.selectedBricksInternal$.getValue();
    }

    constructor(private wallViewModel: WallViewModel) {
    }

    /** Switch brick selection for cursor. */
    switchBrickSelection() {
        if (this.selectedBricks.includes(this.cursorPosition)) {
            this.removeBrickFromSelection(this.cursorPosition);
        } else {
            this.addBrickToSelection(this.cursorPosition);
        }
    }

    setCursorTo(brickId: string) {
        this.cursorPositionInternal$.next(brickId);
    }

    moveCursorToPreviousBrick() {
        const currentCursor = this.cursorPositionInternal$.getValue();
        const previousBrickId = this.wallViewModel.wallModel.api.core2.getPreviousBrickId(currentCursor);

        if (previousBrickId) {
            this.cursorPositionInternal$.next(previousBrickId);
        }
    }

    moveCursorToNextBrick() {
        const currentCursor = this.cursorPositionInternal$.getValue();
        const nextBrickId = this.wallViewModel.wallModel.api.core2.getNextBrickId(currentCursor);

        if (nextBrickId) {
            this.cursorPositionInternal$.next(nextBrickId);
        }
    }

    /** Performs primary action for the brick which cursor is pointed. */
    callBrickPrimaryAction() {
        this.wallViewModel.callBrickPrimaryAction(this.cursorPositionInternal$.getValue(), {
            selectedBrickIds: this.selectedBricks
        });
    }

    // SELECTION
    selectBrick(brickId: string): void {
        this.selectedBricksInternal$.next([brickId]);
    }

    selectBricks(brickIds: string[]) {
        if (JSON.stringify(brickIds) !== JSON.stringify(this.selectedBricks)) {
            this.selectedBricksInternal$.next(this.wallViewModel.wallModel.api.core2.sortBrickIdsByLayoutOrder(brickIds));
        }
    }

    addBrickToSelection(brickId: string): void {
        const selectedBrickIds = this.selectedBricks.slice(0);

        selectedBrickIds.push(brickId);

        this.selectedBricksInternal$.next(
            this.wallViewModel.wallModel.api.core2.sortBrickIdsByLayoutOrder(selectedBrickIds)
        );
    }

    removeBrickFromSelection(brickId: string): void {
        const brickIdIndex = this.selectedBricks.indexOf(brickId);

        this.selectedBricks.splice(brickIdIndex, 1);

        this.selectedBricksInternal$.next(this.selectedBricks.slice(0));
    }

    unSelectAllBricks(): void {
        this.selectedBricksInternal$.next([]);
    }

    /**
     * @public-api
     */
    getSelectedBrickIds(): string[] {
        return this.selectedBricks;
    }
}

export interface IFocusedBrick {
    // todo: rename to brickId
    id: string;
    context?: IFocusContext;
}

/**
 * Stores the state of the View Mode.
 * Performs the brick supporting action based on the mode state.
 */
export class EditMode {
    name = VIEW_MODE.EDIT;

    private focusedBrickInternal$: BehaviorSubject<IFocusedBrick | null> = new BehaviorSubject(null);

    get focusedBrick() {
        return this.focusedBrickInternal$.getValue();
    }

    constructor(private wallViewModel: WallViewModel) {
    }

    focusOnBrickId(brickId: string, focusContext?: IFocusContext) {
        this.focusedBrickInternal$.next({
            id: brickId,
            context: focusContext,
        });

        this.wallViewModel.focusOnBrick(brickId, focusContext);
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

    setFocusedBrickId(brickId: string) {
        this.focusedBrickInternal$.next({
            id: brickId,
            context: null
        });
    }
}

export class Mode {
    private currentModeInternal$: BehaviorSubject<VIEW_MODE> = new BehaviorSubject(VIEW_MODE.EDIT);
    currentMode$: Observable<VIEW_MODE> = this.currentModeInternal$.asObservable();
    get currentMode() {
        return this.currentModeInternal$.getValue();
    }

    edit: EditMode = new EditMode(this.wallViewModel);
    navigation: NavigationMode = new NavigationMode(this.wallViewModel);

    constructor(private wallViewModel: WallViewModel) {
    }

    switchMode() {
        if (this.currentMode === VIEW_MODE.EDIT) {
            this.switchToNavigationMode();
        } else {
            this.switchToEditMode();
        }
    }

    switchToEditMode(focusToBrick: boolean = true) {
        if (this.currentMode === VIEW_MODE.EDIT) {
            console.warn(`${VIEW_MODE.EDIT} mode is already active.`);
            return;
        }

        this.currentModeInternal$.next(VIEW_MODE.EDIT);
        this.navigation.unSelectAllBricks();

        if (focusToBrick) {
            const focusToBrickId = this.navigation.cursorPosition ||
                this.wallViewModel.wallModel.api.core2.query().brickIdBasedOnPosition(0);

            this.edit.focusOnBrickId(focusToBrickId);
        }
    }

    switchToNavigationMode() {
        this.navigation.unSelectAllBricks();
        (document.activeElement as HTMLElement).blur();
        this.currentModeInternal$.next(VIEW_MODE.NAVIGATION);

        let cursorPosition;
        const focusedBrick = this.edit.focusedBrick;

        if (focusedBrick && focusedBrick.id) {
            cursorPosition = focusedBrick.id;
        } else {
            cursorPosition = this.wallViewModel.wallModel.api.core2.query().brickIdBasedOnPosition(0);
        }

        if (cursorPosition) {
            this.navigation.setCursorTo(cursorPosition);
        }
    }
}

export class MediaInteraction {
    private isMediaInteractionEnabledInternal$ = new BehaviorSubject<boolean>(true);
    isMediaInteractionEnabled$ = this.isMediaInteractionEnabledInternal$.asObservable();

    enable() {
        this.isMediaInteractionEnabledInternal$.next(true);
    }

    disable() {
        this.isMediaInteractionEnabledInternal$.next(false);
    }
}

class WallViewApi implements IWallUiApi {
    mediaInteraction = this.wallViewModel.mediaInteraction;
    mode = this.wallViewModel.mode;

    constructor(private wallViewModel: WallViewModel) {
    }
}

class BrickComponent {
    constructor(readonly brickId: string, private brickComponentRef: ComponentRef<any>) {
    }

    isSupportApi(apiName: string) {
        return Boolean(this.brickComponentRef.instance[apiName]);
    }

    onWallFocus(context: IFocusContext) {
        this.call('onWallFocus', context);
    }

    onPrimaryAction(options: IPrimaryActionOption) {
        this.call('onPrimaryAction', options);
    }

    private call(apiName: string, data: any) {
        if (!this.isSupportApi(apiName)) {
            console.warn(`Brick "${this.brickId}" does not support "${apiName}" api.`);
            return;
        }

        this.brickComponentRef.instance[apiName](data);
    }
}

class BrickComponentsStorage {
    private componentRefs: Map<string, BrickComponent> = new Map();

    get(brickId: string) {
        return this.componentRefs.get(brickId);
    }

    register(brickId: string, brickComponentRef: ComponentRef<any>) {
        if (this.componentRefs.has(brickId)) {
            console.warn(`Register duplicate`);
        }

        this.componentRefs.set(brickId, new BrickComponent(brickId, brickComponentRef));
    }

    unRegister(brickId: string) {
        this.componentRefs.delete(brickId);
    }
}

export interface IPrimaryActionOption {
    selectedBrickIds: string[];
}

@Injectable()
export class WallViewModel {
    wallModel: IWallModel = null;
    mediaInteraction = new MediaInteraction();
    viewPlan$: Observable<IWallViewPlan>;
    mode: Mode;
    brickComponentsStorage = new BrickComponentsStorage();

    private wallModelSubscription: Subscription;

    constructor(private brickRegistry: BrickRegistry, private pickOutService: PickOutService) {
    }

    // called by Wall component
    initialize(wallModel: IWallModel) {
        this.wallModel = wallModel;
        this.mode = new Mode(this);

        // register methods on model itself
        this.wallModel.registerApi(WALL_VIEW_API, new WallViewApi(this));

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
                this.mode.navigation.unSelectAllBricks();
            }
        });

        // brick was removed
        this.wallModel.api.core2.events$.pipe(
            filter((event) => {
                return Boolean(event.changes.removed.length > 1);
            })
        ).subscribe((event) => {
            this.mode.switchToEditMode(false);

            let brickIdToFocus;

            if (!this.wallModel.api.core2.query().length()) {
                const {id} = this.wallModel.api.core2.addDefaultBrick();

                brickIdToFocus = id;
            } else {
                const removedChangeWithNearestBrickId: ITransactionRemovedChange = event.changes.removed.reverse()
                    .find((removedChange) => {
                        return Boolean(removedChange.nearestBrickId);
                    });

                brickIdToFocus = removedChangeWithNearestBrickId.nearestBrickId;
            }

            // wait until view re-rendered
            setTimeout(() => {
                this.mode.edit.focusOnBrickId(brickIdToFocus);
            });
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

    focusOnBrick(brickId: string, focusContext?: IFocusContext) {
        if (this.mode.currentMode !== VIEW_MODE.EDIT) {
            console.warn(`Can focus to "${brickId}" only on ${VIEW_MODE.EDIT} mode.`);
            return;
        }

        this.brickComponentsStorage.get(brickId).onWallFocus(focusContext);
    }

    callBrickPrimaryAction(brickId: string, options: IPrimaryActionOption) {
        if (this.mode.currentMode !== VIEW_MODE.NAVIGATION) {
            console.warn(`Can execute primary action for "${brickId}" only in ${VIEW_MODE.NAVIGATION} mode.`);
            return;
        }

        const brickComponent = this.brickComponentsStorage.get(brickId);

        brickComponent.onPrimaryAction(options);

        const isSetFocusSwitchingToEditMode = !brickComponent.isSupportApi('onPrimaryAction');

        this.mode.switchToEditMode(isSetFocusSwitchingToEditMode);

        // set focus silently (do not call brick component onWallFocus callback)
        if (!isSetFocusSwitchingToEditMode) {
            this.mode.edit.setFocusedBrickId(brickId);
        }
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

        this.mode.navigation.unSelectAllBricks();
    }
}
