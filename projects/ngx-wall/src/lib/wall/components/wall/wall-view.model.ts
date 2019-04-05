import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {SelectedBrickEvent} from './events/selected-brick.event';
import {IFocusedBrick} from './interfaces/focused-brick.interface';
import {IWallUiApi} from './interfaces/ui-api.interface';
import {IFocusContext} from './interfaces/wall-component/wall-component-focus-context.interface';
import {IWallModel} from '../../model/interfaces/wall-model.interface';
import {BrickRegistry} from '../../registry/brick-registry.service';
import {IWallRow} from '../../model/interfaces/wall-row.interface';
import {RemoveBricksEvent} from '../../plugins/core/events/remove-bricks.event';
import {MoveBrickEvent} from '../../plugins/core/events/move-brick.event';
import {TurnBrickIntoEvent} from '../../plugins/core/events/turn-brick-into.event';
import {BeforeChangeEvent} from '../../plugins/core/events/before-change.event';

@Injectable()
export class WallViewModel implements IWallUiApi {
    wallModel: IWallModel = null;

    events: Subject<any> = new Subject();

    // UI
    focusedBrick: IFocusedBrick = null;
    selectedBricks: string[] = [];
    isMediaInteractionEnabled$: Observable<boolean> = new BehaviorSubject(true);
    canvasLayout: IWallRow[] = [];

    private wallModelSubscription: Subscription;

    constructor(private brickRegistry: BrickRegistry) {
    }

    getCanvasLayout(): IWallRow[] {
        const rows = [];

        this.wallModel.api.core.traverse((row) => {
            rows.push({
                id: row.id,

                columns: row.columns.map((column) => {
                    return {
                        bricks: column.bricks.map((brickConfig) => {
                            const component = this.brickRegistry.get(brickConfig.tag).component;

                            return {
                                id: brickConfig.id,
                                hash: brickConfig.tag + brickConfig.id,
                                state: brickConfig.state,
                                component
                            };
                        })
                    };
                })
            });
        });

        return rows;
    }

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

        this.wallModelSubscription = this.wallModel.api.core.subscribe((event) => {
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
        });

        this.canvasLayout = this.getCanvasLayout();
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
        const previousTextBrickId = this.wallModel.api.core.getPreviousTextBrickId(brickId);

        if (previousTextBrickId) {
            this.focusOnBrickId(previousTextBrickId, focusContext);
        }
    }

    /**
     * @public-api
     */
    focusOnNextTextBrick(brickId: string, focusContext?: IFocusContext) {
        const nextTextBrickId = this.wallModel.api.core.getNextTextBrickId(brickId);

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
        const currentBrickIds = this.wallModel.api.core.getBrickIds();

        if (currentBrickIds.length > 1) {
            this.wallModel.api.core.removeBricks(brickIds);
        } else if (currentBrickIds.length === 1) {
            const brickSnapshot = this.wallModel.api.core.getBrickSnapshot(currentBrickIds[0]);

            if (brickSnapshot.tag !== 'text' || brickSnapshot.state.text) {
                this.wallModel.api.core.removeBricks(brickIds);
            } else {
                this.focusOnBrickId(currentBrickIds[0]);
            }
        }
    }

    // canvas interaction
    onCanvasClick() {
        // check whether the last element is empty text brick
        // which is inside one column row

        const rowCount = this.wallModel.api.core.getRowCount();
        const brickIds = this.wallModel.api.core.getBrickIds();

        if (rowCount > 0
            && this.wallModel.api.core.getColumnCount(rowCount - 1) === 1
            && brickIds.length) {
            const lastBrickSnapshot = this.wallModel.api.core.getBrickSnapshot(brickIds[brickIds.length - 1]);

            if (lastBrickSnapshot.tag === 'text' && !lastBrickSnapshot.state.text) {
                this.focusOnBrickId(lastBrickSnapshot.id);
            } else {
                this.wallModel.api.core.addDefaultBrick();
            }
        } else {
            this.wallModel.api.core.addDefaultBrick();
        }
    }

    // canvas interaction
    onBrickStateChanged(brickId: string, brickState: any): void {
        this.wallModel.api.core.updateBrickState(brickId, brickState);
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
