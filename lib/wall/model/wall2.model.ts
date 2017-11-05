import { WallDefinition } from "../wall.interfaces";
import { LayoutStore } from "../components/wall/layout-store.service";
import { BrickRegistry } from "../registry/brick-registry.service";
import { BrickStore } from "../components/wall/brick-store.service";
import { Subscription } from 'rxjs/Subscription';
import {
    AddBrickEvent,
    RemoveBrickEvent,
    RemoveBricksEvent,
    UpdateBrickStateEvent
} from "../components/wall/wall.events";
import { Subject } from 'rxjs/Subject';

/**
 *
 * STEP BY STEP REFACTORING
 *
 * - move layout and brick storage to the model
 * - eliminate API dependency
 * - refactor storage
 *
 * */

export class Wall2Model {
    layout: any;

    events: Subject<any> = new Subject();

    constructor(public brickStore: BrickStore,
                public brickRegistry: BrickRegistry,
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
        this.brickStore.turnBrickInto(brickId, newTag);
        this.layoutStore.updateCanvasLayout();

        // todo refactoring
        // this.focusOnBrickId(brickId);
    }

    isRegisteredBrick(tag: string) {
        return Boolean(this.brickRegistry.get(tag));
    }

    /* Add text brick to the bottom of wall in the new row */
    addDefaultBrick() {
        if (!this.brickStore.getBricksCount()) {
            this.addBrick('text', 0, 0, 0);
        } else {
            this.addBrickAtTheEnd('text');
        }
    }

    /* Add brick to existing row and existing column */
    addBrick(tag: string, targetRowIndex: number, targetColumnIndex: number, positionIndex: number) {
        if (this.layoutStore.isColumnExist(targetRowIndex, targetColumnIndex)) {
            const newBrick = this.brickStore.create(tag);

            this.layoutStore.addBrick(newBrick.id, targetRowIndex, targetColumnIndex, positionIndex);

            // todo refactoring
            // this.focusOnBrickId(newBrick.id);

            this.events.next(new AddBrickEvent(newBrick.id));
        }
    }

    /* Create new row and and put brick to it */
    addBrickToNewRow(tag: string, targetRowIndex: number) {
        const totalRowCount = this.layoutStore.getRowCount();
        const lastRowIndex = totalRowCount - 1;

        // user cannot create row in position more than last row index + 1
        if (targetRowIndex > (lastRowIndex + 1)) {
            targetRowIndex = lastRowIndex + 1;
        }

        const newBrick = this.brickStore.create(tag);

        this.layoutStore.addBrickToNewRow(newBrick.id, targetRowIndex);

        // todo refactoring
        // this.focusOnBrickId(newBrick.id);

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

    /**
     * @public
     * */
    addBrickAfterBrickId(brickId: string, tag: string) {
        const brickPosition = this.layoutStore.getBrickPositionByBrickId(brickId);
        const columnCount = this.layoutStore.getColumnCount(brickPosition.rowIndex);

        if (columnCount === 1) {
            this.addBrickAfterInNewRow(brickId, tag);
        } else if (columnCount > 1) {
            this.addBrickAfterInSameColumn(brickId, tag);
        }
    }

    /*
    * Add brick to the new row in the bottom of whole wall
    * */
    addBrickAtTheEnd(tag: string) {
        const isLastBrickEmptyText = this.isLastBrickEmptyText();

        if (tag === 'text' && isLastBrickEmptyText) {
            // todo refactoring
            // this.focusOnBrickId(isLastBrickEmptyText.id);
        } else {
            this.addBrickToNewRow(tag, this.layoutStore.getRowCount());
        }
    }

    /**
     * @public
     * */
    moveBrickAfterBrickId(targetBrickIds: string[], beforeBrickId: string) {
        if (targetBrickIds.indexOf(beforeBrickId) === -1) {
            const brickPosition = this.layoutStore.getBrickPositionByBrickId(beforeBrickId);
            const columnCount = this.layoutStore.getColumnCount(brickPosition.rowIndex);

            if (columnCount === 1) {
                this.moveBrickAfterInNewRow(targetBrickIds, beforeBrickId);
            } else {
                this.moveBrickAfterInSameColumn(targetBrickIds, beforeBrickId);
            }

            // todo refactoring
            // this.unSelectBricks();
        }
    }

    /**
     * @public
     * */
    moveBrickBeforeBrickId(targetBrickIds: string[], beforeBrickId: string) {
        if (targetBrickIds.indexOf(beforeBrickId) === -1) {
            const brickPosition = this.layoutStore.getBrickPositionByBrickId(beforeBrickId);
            const columnCount = this.layoutStore.getColumnCount(brickPosition.rowIndex);

            if (columnCount === 1) {
                this.moveBrickBeforeInNewRow(targetBrickIds, beforeBrickId);
            } else {
                this.moveBrickBeforeInSameColumn(targetBrickIds, beforeBrickId);
            }

            // todo refactoring
            // this.unSelectBricks();
        }
    }

    /**
     * @public
     * */
    moveBrickToNewColumn(targetBrickIds: string[], beforeBrickId: string, side: string) {
        if (targetBrickIds.indexOf(beforeBrickId) === -1) {
            this.layoutStore.moveBrickToNewColumn(targetBrickIds, beforeBrickId, side);

            // todo refactoring
            // this.unSelectBricks();
        }
    }

    removeBrick(brickId: string) {
        const isOnlyOneBrickEmptyText = this.isOnlyOneBrickEmptyText();

        if (isOnlyOneBrickEmptyText) {
            // todo refactoring
            // this.focusOnBrickId(isOnlyOneBrickEmptyText.id);
        } else {
            // should find next/prev brick before remove target brick
            const previousTextBrickId = this.layoutStore.getPreviousTextBrick(brickId);
            const nextTextBrickId = this.layoutStore.getNextTextBrick(brickId);

            this.brickStore.remove(brickId);
            this.layoutStore.removeBrick(brickId);

            if (previousTextBrickId) {
                // todo refactoring
                // this.focusOnBrickId(previousTextBrickId);
            } else if (nextTextBrickId) {
                // todo refactoring
                // this.focusOnBrickId(nextTextBrickId);
            }

            this.events.next(new RemoveBrickEvent(brickId));
        }
    }

    removeBricks(brickIds): void {
        const isOnlyOneBrickEmptyText = this.isOnlyOneBrickEmptyText();

        if (isOnlyOneBrickEmptyText) {
            // todo refactoring
            // this.focusOnBrickId(isOnlyOneBrickEmptyText.id);
        } else {
            brickIds = this.layoutStore.sortBrickIds(brickIds);

            // should find next/prev brick before remove target brick
            const previousTextBrickId = this.layoutStore.getPreviousTextBrick(brickIds[0]);
            const nextTextBrickId = this.layoutStore.getNextTextBrick(brickIds[brickIds.length - 1]);

            brickIds.forEach((brickId) => {
                this.brickStore.remove(brickId);
                this.layoutStore.removeBrick(brickId);
            });

            if (previousTextBrickId) {
                // todo refactoring
                // this.focusOnBrickId(previousTextBrickId);
            } else if (nextTextBrickId) {
                // todo refactoring
                // this.focusOnBrickId(nextTextBrickId);
            } else if (!this.brickStore.getBricksCount()) {
                this.addBrick('text', 0, 0, 0);
            }

            this.events.next(new RemoveBricksEvent(brickIds));
        }
    }

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean {
        return this.layoutStore.isBrickAheadOf(firstBrickId, secondBrickId);
    }

    subscribe(callback: any): Subscription {
        return this.events.subscribe(callback);
    }

    reset() {
        this.brickStore.reset();
        this.layoutStore.reset();

        // todo refactoring
        // this.focusedBrickId = null;

        // this.unSelectBricks();
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

    private isOnlyOneBrickEmptyText() {
        const brickLength = this.brickStore.getBricksCount();

        return brickLength === 1 ? this.isLastBrickEmptyText() : null;

    }

    // TODO: method should return boolean value
    private isLastBrickEmptyText() {
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
}