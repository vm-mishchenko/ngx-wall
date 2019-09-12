import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {PickOutService} from '../../../modules/pick-out/pick-out.service';
import {IBrickDefinition} from '../../model/interfaces/brick-definition.interface';
import {IWallModel} from '../../model/interfaces/wall-model.interface';
import {IWallRow} from '../../model/interfaces/wall-row.interface';
import {BrickRegistry} from '../../registry/brick-registry.service';
import {SelectedBrickEvent} from './events/selected-brick.event';
import {IFocusedBrick} from './interfaces/focused-brick.interface';
import {IWallUiApi} from './interfaces/ui-api.interface';
import {IFocusContext} from './interfaces/wall-component/wall-component-focus-context.interface';

export type IWallViewPlan = IViewBrickDefinition[];

export interface IViewBrickDefinition {
    brick: IBrickDefinition;
    component: any; // UI component
}


@Injectable()
export class WallViewModel implements IWallUiApi {
    wallModel: IWallModel = null;

    events: Subject<any> = new Subject();

    // UI
    focusedBrick: IFocusedBrick = null;
    selectedBricks: string[] = [];
    isMediaInteractionEnabled$: Observable<boolean> = new BehaviorSubject(true);
    canvasLayout: IWallRow[] = [];
    viewPlan$: Observable<IWallViewPlan>;

    private wallModelSubscription: Subscription;

    constructor(private brickRegistry: BrickRegistry, private pickOutService: PickOutService) {
    }

    // called by Wall component
    initialize(wallModel: IWallModel) {
        this.wallModel = wallModel;

        // initialize view core API
        const coreApi = [
            // SELECTION
            'getSelectedBrickIds',
            'selectBrick',
            'selectBricks',
            'addBrickToSelection',
            'removeBrickFromSelection',
            'unSelectBricks',

            // FOCUS
            'focusOnBrickId',
            'getFocusedBrickId',
            'focusOnPreviousTextBrick',
            'focusOnNextTextBrick',

            // REMOVE BRICK
            'removeBrick',
            'removeBricks',

            // BEHAVIOUR
            'enableMediaInteraction',
            'disableMediaInteraction',

            // CLIENT
            'subscribe'
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
        /*this.wallModelSubscription = this.wallModel.api.core.subscribe((event) => {
            if (event instanceof TurnBrickIntoEvent) {
                this.focusOnBrickId(event.brickId);
            }

            if (event instanceof MoveBrickEvent) {
                this.unSelectBricks();
            }

            if (event instanceof RemoveBricksEvent) {
                if (!this.wallModel.api.core.getBricksCount()) {
                    this.wallModel.api.core.addDefaultBrick();
                }
            }

            if (!(event instanceof BeforeChangeEvent)) {
                this.canvasLayout = this.getCanvasLayout();
            }
        });*/

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
    selectBrick(brickId: string): void {
        this.selectedBricks = [brickId];

        this.focusedBrick = null;

        const selectedBricksClone = this.selectedBricks.slice(0);

        this.dispatch(new SelectedBrickEvent(selectedBricksClone));
    }

    /**
     * @public-api
     */
    selectBricks(brickIds: string[]) {
        if (JSON.stringify(brickIds) !== JSON.stringify(this.selectedBricks)) {
            this.selectedBricks = this.wallModel.api.core.sortBrickIdsByLayoutOrder(brickIds);

            const selectedBricksClone = this.selectedBricks.slice(0);

            this.dispatch(new SelectedBrickEvent(selectedBricksClone));
        }
    }

    /**
     * @deprecated
     * @public-api
     */
    addBrickToSelection(brickId: string): void {
        const selectedBrickIds = this.selectedBricks.slice(0);

        selectedBrickIds.push(brickId);

        this.selectedBricks = this.wallModel.api.core.sortBrickIdsByLayoutOrder(selectedBrickIds);

        const selectedBricksClone = this.selectedBricks.slice(0);

        this.dispatch(new SelectedBrickEvent(selectedBricksClone));
    }

    /**
     * @deprecated
     * @public-api
     */
    removeBrickFromSelection(brickId: string): void {
        const brickIdIndex = this.selectedBricks.indexOf(brickId);

        this.selectedBricks.splice(brickIdIndex, 1);

        this.selectedBricks = this.selectedBricks.slice(0);

        const selectedBricksClone = this.selectedBricks.slice(0);

        this.dispatch(new SelectedBrickEvent(selectedBricksClone));
    }

    /**
     * @public-api
     */
    unSelectBricks(): void {
        this.selectedBricks = [];

        this.dispatch(new SelectedBrickEvent([]));
    }

    /**
     * @public-api
     */
    getSelectedBrickIds(): string[] {
        return this.selectedBricks.slice(0);
    }

    /**
     * @public-api
     */
    getFocusedBrickId(): string {
        return this.focusedBrick && this.focusedBrick.id;
    }

    /**
     * @public-api
     */
    focusOnBrickId(brickId: string, focusContext?: IFocusContext): void {
        this.focusedBrick = {
            id: brickId,
            context: focusContext
        };
    }

    /**
     * @public-api
     */
    focusOnPreviousTextBrick(brickId: string, focusContext?: IFocusContext) {
        const previousTextBrickId = this.wallModel.api.core2.getPreviousTextBrickId(brickId);

        if (previousTextBrickId) {
            this.focusOnBrickId(previousTextBrickId, focusContext);
        }
    }

    /**
     * @public-api
     */
    focusOnNextTextBrick(brickId: string, focusContext?: IFocusContext) {
        const nextTextBrickId = this.wallModel.api.core2.getNextTextBrickId(brickId);

        if (nextTextBrickId) {
            this.focusOnBrickId(nextTextBrickId, focusContext);
        }
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

    /**
     * @public-api
     */
    subscribe(callback: any): Subscription {
        return this.events.subscribe(callback);
    }

    /**
     * @public-api
     */
    removeBrick(brickId: string) {
        this.removeBricks([brickId]);
    }

    /**
     * @public-api
     */
    removeBricks(brickIds: string[]) {
        const currentBrickIds = this.wallModel.api.core2.getBrickIds();

        if (currentBrickIds.length > 1) {
            this.wallModel.api.core2.removeBricks(brickIds);
        } else if (currentBrickIds.length === 1) {
            const brickSnapshot = this.wallModel.api.core2.getBrickSnapshot(currentBrickIds[0]);

            if (brickSnapshot.tag !== 'text' || brickSnapshot.state.text) {
                this.wallModel.api.core2.removeBricks(brickIds);
            } else {
                this.focusOnBrickId(currentBrickIds[0]);
            }
        }
    }

    onCanvasClick() {
        const lastBrick = this.wallModel.api.core2.query().lastBrick();

        if (lastBrick && lastBrick.tag === 'text' && !lastBrick.data.text) {
            this.focusOnBrickId(lastBrick.id);
            return;
        }

        this.wallModel.api.core2.addDefaultBrick();
    }

    // canvas interaction
    onBrickStateChanged(brickId: string, brickState: any): void {
        this.wallModel.api.core2.updateBrickState(brickId, brickState);
    }

    reset() {
        this.wallModelSubscription.unsubscribe();

        this.wallModelSubscription = null;

        this.focusedBrick = null;

        this.unSelectBricks();
    }

    private dispatch(e) {
        this.events.next(e);
    }
}
