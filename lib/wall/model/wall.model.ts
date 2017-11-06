import { IWallModel, WallDefinition } from '../wall.interfaces';
import { LayoutStore } from '../components/wall/layout-store.service';
import { BrickStore } from '../components/wall/brick-store.service';
import { Subscription } from 'rxjs/Subscription';
import {
    AddBrickEvent,
    MoveBrickEvent,
    RemoveBrickEvent,
    RemoveBricksEvent,
    TurnBrickIntoEvent,
    UpdateBrickStateEvent
} from './wall.events';
import { Subject } from 'rxjs/Subject';

/**
 *
 * STEP BY STEP REFACTORING
 *
 * + move layout and brick storage to the model
 * + eliminate API dependency
 * - wall-view.model should build layout based on the wall.model
 * - eliminate layout storage and brick storage - create one tree storage
 * - add version for the Wall Definition
 *
 * */

export class WallModel implements IWallModel {
    private events: Subject<any> = new Subject();

    constructor(public brickStore: BrickStore,
                public layoutStore: LayoutStore) {
    }

    initialize(plan: WallDefinition) {
        this.brickStore.initialize(plan.bricks);
        this.layoutStore.initialize(plan.layout);
    }

    getNextBrickId(brickId: string): string {
        return this.layoutStore.getNextBrickId(brickId);
    }

    getPreviousBrickId(brickId: string) {
        return this.layoutStore.getPreviousBrickId(brickId);
    }

    getNextTextBrick(brickId: string) {
        return this.layoutStore.getNextTextBrick(brickId);
    }

    getPreviousTextBrick(brickId: string) {
        return this.layoutStore.getPreviousTextBrick(brickId);
    }

    getPlan(): WallDefinition {
        return {
            bricks: this.brickStore.serialize(),
            layout: this.layoutStore.serialize()
        }
    }

    updateBrickState(brickId, brickState) {
        this.brickStore.updateBrickState(brickId, brickState);

        this.events.next(new UpdateBrickStateEvent(brickId, brickState));
    }

    turnBrickInto(brickId: string, newTag: string) {
        const oldTag = this.brickStore.getBrickTagById(brickId);
        this.brickStore.turnBrickInto(brickId, newTag);

        this.events.next(new TurnBrickIntoEvent(brickId, newTag, oldTag));
    }

    // Add text brick to the bottom of wall in the new row
    addDefaultBrick() {
        if (!this.brickStore.getBricksCount()) {
            this.addBrick('text', 0, 0, 0);
        } else {
            this.addBrickAtTheEnd('text');
        }
    }

    // Add brick to existing row and existing column
    addBrick(tag: string, targetRowIndex: number, targetColumnIndex: number, positionIndex: number) {
        if (this.layoutStore.isColumnExist(targetRowIndex, targetColumnIndex)) {
            const newBrick = this.brickStore.create(tag);

            this.layoutStore.addBrick(newBrick.id, targetRowIndex, targetColumnIndex, positionIndex);

            this.events.next(new AddBrickEvent(newBrick.id));
        }
    }

    // Create new row and and put brick to it
    addBrickToNewRow(tag: string, targetRowIndex: number) {
        const totalRowCount = this.layoutStore.getRowCount();
        const lastRowIndex = totalRowCount - 1;

        // user cannot create row in position more than last row index + 1
        if (targetRowIndex > (lastRowIndex + 1)) {
            targetRowIndex = lastRowIndex + 1;
        }

        const newBrick = this.brickStore.create(tag);

        this.layoutStore.addBrickToNewRow(newBrick.id, targetRowIndex);

        this.events.next(new AddBrickEvent(newBrick.id));
    }

    addBrickAfterInSameColumn(brickId: string, tag: string) {
        const brickPosition = this.layoutStore.getBrickPositionByBrickId(brickId);

        this.addBrick(tag, brickPosition.rowIndex, brickPosition.columnIndex, brickPosition.brickIndex + 1);
    }

    addBrickAfterInNewRow(brickId: string, tag: string) {
        const brickPosition = this.layoutStore.getBrickPositionByBrickId(brickId);

        this.addBrickToNewRow(tag, brickPosition.rowIndex + 1);
    }

    addBrickAfterBrickId(brickId: string, tag: string) {
        const brickPosition = this.layoutStore.getBrickPositionByBrickId(brickId);
        const columnCount = this.layoutStore.getColumnCount(brickPosition.rowIndex);

        if (columnCount === 1) {
            this.addBrickAfterInNewRow(brickId, tag);
        } else if (columnCount > 1) {
            this.addBrickAfterInSameColumn(brickId, tag);
        }
    }

    // Add brick to the new row in the bottom of whole wall
    addBrickAtTheEnd(tag: string) {
        this.addBrickToNewRow(tag, this.layoutStore.getRowCount());
    }

    moveBrickAfterBrickId(targetBrickIds: string[], beforeBrickId: string) {
        const brickPosition = this.layoutStore.getBrickPositionByBrickId(beforeBrickId);
        const columnCount = this.layoutStore.getColumnCount(brickPosition.rowIndex);

        if (columnCount === 1) {
            this.moveBrickAfterInNewRow(targetBrickIds, beforeBrickId);
        } else {
            this.moveBrickAfterInSameColumn(targetBrickIds, beforeBrickId);
        }

        this.events.next(new MoveBrickEvent(targetBrickIds, beforeBrickId));
    }

    moveBrickBeforeBrickId(targetBrickIds: string[], beforeBrickId: string) {
        const brickPosition = this.layoutStore.getBrickPositionByBrickId(beforeBrickId);
        const columnCount = this.layoutStore.getColumnCount(brickPosition.rowIndex);

        if (columnCount === 1) {
            this.moveBrickBeforeInNewRow(targetBrickIds, beforeBrickId);
        } else {
            this.moveBrickBeforeInSameColumn(targetBrickIds, beforeBrickId);
        }

        this.events.next(new MoveBrickEvent(targetBrickIds, beforeBrickId));
    }

    moveBrickToNewColumn(targetBrickIds: string[], beforeBrickId: string, side: string) {
        this.layoutStore.moveBrickToNewColumn(targetBrickIds, beforeBrickId, side);

        this.events.next(new MoveBrickEvent(targetBrickIds, beforeBrickId));
    }

    removeBrick(brickId: string) {
        const previousTextBrickId = this.layoutStore.getPreviousTextBrick(brickId);
        const nextTextBrickId = this.getNextTextBrick(brickId);

        this.brickStore.remove(brickId);
        this.layoutStore.removeBrick(brickId);

        this.events.next(new RemoveBrickEvent(brickId, previousTextBrickId, nextTextBrickId));
    }

    removeBricks(brickIds): void {
        brickIds = this.layoutStore.sortBrickIds(brickIds);

        // should find next/prev brick before remove target brick
        const previousTextBrickId = this.layoutStore.getPreviousTextBrick(brickIds[0]);
        const nextTextBrickId = this.getNextTextBrick(brickIds[brickIds.length - 1]);

        brickIds.forEach((brickId) => {
            this.brickStore.remove(brickId);
            this.layoutStore.removeBrick(brickId);
        });

        this.events.next(new RemoveBricksEvent(brickIds, previousTextBrickId, nextTextBrickId));
    }

    getBricksCount() {
        return this.brickStore.getBricksCount();
    }

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean {
        return this.layoutStore.isBrickAheadOf(firstBrickId, secondBrickId);
    }

    subscribe(callback: any): Subscription {
        return this.events.subscribe(callback);
    }

    isOnlyOneBrickEmptyText(): any {
        const brickLength = this.brickStore.getBricksCount();

        return brickLength === 1 ? this.isLastBrickEmptyText() : null;
    }

    // TODO: method should return boolean value
    isLastBrickEmptyText(): any {
        const lastBrickId = this.layoutStore.getLastBrickId();

        if (lastBrickId) {
            const lastBrick = this.brickStore.getBrickStorageById(lastBrickId);

            if (lastBrick.tag === 'text' && !lastBrick.data['text']) {
                return lastBrick;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    traverse(fn: Function) {
        return this.layoutStore.layout.bricks.map((row) => {
            const preparedRow = {
                columns: row.columns.map((column) => {
                    return {
                        bricks: column.bricks.map((brickConfig) => {
                            const brickStorage = this.brickStore.getBrickStorageById(brickConfig.id);

                            return {
                                id: brickConfig.id,
                                tag: brickStorage.tag,
                                state: brickStorage.state
                            }
                        })
                    }
                })
            };

            fn(preparedRow);
        });
    }

    private moveBrickAfterInNewRow(targetBrickIds: string[], beforeBrickId: string) {
        this.layoutStore.moveBrickAfterInNewRow(targetBrickIds, beforeBrickId);
    }

    private moveBrickBeforeInNewRow(targetBrickIds: string[], beforeBrickId: string) {
        this.layoutStore.moveBrickBeforeInNewRow(targetBrickIds, beforeBrickId);
    }

    private moveBrickAfterInSameColumn(targetBrickIds: string[], beforeBrickId: string) {
        this.layoutStore.moveBrickAfterInSameColumn(targetBrickIds, beforeBrickId);
    }

    private moveBrickBeforeInSameColumn(targetBrickIds: string[], beforeBrickId: string) {
        this.layoutStore.moveBrickBeforeInSameColumn(targetBrickIds, beforeBrickId);
    }
}