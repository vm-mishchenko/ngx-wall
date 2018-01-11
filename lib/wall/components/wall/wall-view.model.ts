import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { ReactiveProperty, ReactiveReadOnlyProperty } from '../../../reactive-property';
import {
    AddBrickEvent, MoveBrickEvent, RemoveBrickEvent, RemoveBricksEvent,
    TurnBrickIntoEvent
} from '../../model/wall.events';
import { BrickRegistry } from '../../registry/brick-registry.service';
import { IWallModel, IWallViewModel } from '../../wall.interfaces';
import { IWallCoreApi } from './interfaces/wall-core-api.interface';
import { IWallState } from './interfaces/wall-state.interface';

import { WallApi } from './wall-api.service';
import { WALL } from './wall.constant';
import { IFocusContext } from './wall.interfaces';

@Injectable()
export class WallViewModel implements IWallViewModel {
    wallModel: IWallModel = null;

    events: Subject<any> = new Subject();

    // UI
    focusedBrick: { id: string, context?: IFocusContext } = null;

    selectedBricks: string[] = [];

    writeState = {
        mode: new ReactiveProperty<string>(WALL.MODES.EDIT),
        isMediaInteractionEnabled: new ReactiveProperty<boolean>(true)
    };

    state: IWallState = {
        mode: new ReactiveReadOnlyProperty(this.writeState.mode.getValue(), this.writeState.mode.valueChanged),
        isMediaInteractionEnabled: new ReactiveReadOnlyProperty(
            this.writeState.isMediaInteractionEnabled.getValue(),
            this.writeState.isMediaInteractionEnabled.valueChanged
        )
    };

    private wallModelSubscription: Subscription;

    constructor(public api: WallApi,
                private brickRegistry: BrickRegistry) {
    }

    get canvasLayout() {
        return this.wallModel ? this.getCanvasLayout() : null;
    }

    getCanvasLayout() {
        const canvasLayout = {
            rows: []
        };

        this.wallModel.traverse((row) => {
            canvasLayout.rows.push({
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

        return canvasLayout;
    }

    initialize(wallModel: IWallModel) {
        this.wallModel = wallModel;

        // initialize view core API
        const coreApi = [
            'state',

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

            // NAVIGATION
            'getPreviousBrickId',
            'getNextBrickId',
            'getNextTextBrickId',
            'getPreviousTextBrickId',
            'isBrickAheadOf',

            // BEHAVIOUR
            'enableMediaInteraction',
            'disableMediaInteraction',

            // CLIENT
            'getPlan',
            'subscribe',

            // BRICk
            'isRegisteredBrick',
            'turnBrickInto',
            'updateBrickState',
            'getBrickSnapshot',
            'getBrickTextRepresentation',

            // MOVE BRICK
            'moveBrickAfterBrickId',
            'moveBrickBeforeBrickId',
            'moveBrickToNewColumn',

            // ADD BRICK
            'addBrickAfterBrickId'
        ].reduce((result, methodName) => {
            let method;

            if (this[methodName] && this[methodName].bind) {
                method = this[methodName].bind(this);
            }

            if (!method && this.wallModel[methodName] && this.wallModel[methodName].bind) {
                method = this.wallModel[methodName].bind(this.wallModel);
            }

            result[methodName] = method;

            return result;
        }, {});

        this.api.registerCoreApi(coreApi as IWallCoreApi);

        // protect API from extending
        Object.seal(this.api.core);

        this.wallModelSubscription = this.wallModel.subscribe((event) => {
            if (event instanceof AddBrickEvent) {
                this.focusOnBrickId(event.brickId);
            }

            if (event instanceof TurnBrickIntoEvent) {
                this.focusOnBrickId(event.brickId);
            }

            if (event instanceof MoveBrickEvent) {
                this.unSelectBricks();
            }

            if (event instanceof RemoveBrickEvent) {
                if (event.previousBrickId) {
                    this.focusOnBrickId(event.previousBrickId);
                } else if (event.nextBrickId) {
                    this.focusOnBrickId(event.nextBrickId);
                }
            }

            if (event instanceof RemoveBricksEvent) {
                if (event.previousBrickId) {
                    this.focusOnBrickId(event.previousBrickId);
                } else if (event.nextBrickId) {
                    this.focusOnBrickId(event.nextBrickId);
                } else if (!this.wallModel.getBricksCount()) {
                    // todo:  this.wallModel.addBrick('text', 0, 0, 0);
                }
            }

            this.events.next(event);
        });
    }

    /**
     * @public-api
     */
    selectBrick(brickId: string): void {
        this.selectedBricks = [brickId];

        this.focusedBrick = null;
    }

    /**
     * @public-api
     */
    selectBricks(brickIds: string[]) {
        if (JSON.stringify(brickIds) !== JSON.stringify(this.selectedBricks)) {
            this.selectedBricks = brickIds;
        }
    }

    /**
     * @public-api
     */
    addBrickToSelection(brickId: string): void {
        this.selectedBricks = this.selectedBricks.slice(0);
        this.selectedBricks.push(brickId);
    }

    /**
     * @public-api
     */
    removeBrickFromSelection(brickId: string): void {
        const brickIdIndex = this.selectedBricks.indexOf(brickId);

        this.selectedBricks.splice(brickIdIndex, 1);

        this.selectedBricks = this.selectedBricks.slice(0);
    }

    /**
     * @public-api
     */
    unSelectBricks(): void {
        this.selectedBricks = [];
    }

    /**
     * @public-api
     */
    getSelectedBrickIds(): string[] {
        return this.selectedBricks;
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
        this.focusedBrick = null;

        // wait until new brick will be rendered
        setTimeout(() => {
            this.focusedBrick = {
                id: brickId,
                context: focusContext
            };
        });
    }

    /**
     * @public-api
     */
    focusOnPreviousTextBrick(brickId: string, focusContext?: IFocusContext) {
        const previousTextBrickId = this.wallModel.getPreviousTextBrickId(brickId);

        if (previousTextBrickId) {
            this.focusOnBrickId(previousTextBrickId, focusContext);
        }
    }

    /**
     * @public-api
     */
    focusOnNextTextBrick(brickId: string, focusContext?: IFocusContext) {
        const nextTextBrickId = this.wallModel.getNextTextBrickId(brickId);

        if (nextTextBrickId) {
            this.focusOnBrickId(nextTextBrickId, focusContext);
        }
    }

    /**
     * @public-api
     */
    enableMediaInteraction() {
        this.writeState.isMediaInteractionEnabled.setValue(true);
    }

    /**
     * @public-api
     */
    disableMediaInteraction() {
        this.writeState.isMediaInteractionEnabled.setValue(false);
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
    moveBrickAfterBrickId(targetBrickIds: string[], beforeBrickId: string) {
        if (targetBrickIds.indexOf(beforeBrickId) === -1) {
            this.wallModel.moveBrickAfterBrickId(targetBrickIds, beforeBrickId);
        }
    }

    /**
     * @public-api
     */
    moveBrickBeforeBrickId(targetBrickIds: string[], beforeBrickId: string) {
        if (targetBrickIds.indexOf(beforeBrickId) === -1) {
            this.wallModel.moveBrickBeforeBrickId(targetBrickIds, beforeBrickId);
        }
    }

    /**
     * @public-api
     */
    moveBrickToNewColumn(targetBrickIds: string[], beforeBrickId: string, side: string) {
        if (targetBrickIds.indexOf(beforeBrickId) === -1) {
            this.wallModel.moveBrickToNewColumn(targetBrickIds, beforeBrickId, side);
        }
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
        const currentBrickIds = this.wallModel.getBrickIds();

        if (currentBrickIds.length > 1) {
            this.wallModel.removeBricks(brickIds);
        } else if (currentBrickIds.length === 1) {
            const brickSnapshot = this.wallModel.getBrickSnapshot(currentBrickIds[0]);

            if (brickSnapshot.tag !== 'text' || brickSnapshot.state.text) {
                this.wallModel.removeBricks(brickIds);
            } else {
                this.focusOnBrickId(currentBrickIds[0]);
            }
        } else {
            this.focusOnBrickId(currentBrickIds[0]);
        }
    }

    // canvas interaction
    onFocusedBrick(brickId: string) {
        if (!this.focusedBrick || (this.focusedBrick.id !== brickId)) {
            this.focusedBrick = {
                id: brickId,
                context: undefined
            };
        }

        this.unSelectBricks();
    }

    // canvas interaction
    onCanvasClick() {
        // check whether the last element is empty text brick
        // which is inside one column row

        const rowCount = this.wallModel.getRowCount();
        const brickIds = this.wallModel.getBrickIds();

        if (rowCount > 0
            && this.wallModel.getColumnCount(rowCount - 1) === 1
            && brickIds.length) {
            const lastBrickSnapshot = this.wallModel.getBrickSnapshot(brickIds[brickIds.length - 1]);

            if (lastBrickSnapshot.tag === 'text' && !lastBrickSnapshot.state.text) {
                this.focusOnBrickId(lastBrickSnapshot.id);
            } else {
                this.wallModel.addDefaultBrick();
            }
        } else {
            this.wallModel.addDefaultBrick();
        }
    }

    // canvas interaction
    onBrickStateChanged(brickId: string, brickState: any): void {
        this.wallModel.updateBrickState(brickId, brickState);
    }

    /**
     * @public-api
     */
    isRegisteredBrick(tag: string) {
        return Boolean(this.brickRegistry.get(tag));
    }

    reset() {
        this.wallModelSubscription.unsubscribe();

        this.wallModelSubscription = null;

        this.focusedBrick = null;

        this.unSelectBricks();
    }
}
