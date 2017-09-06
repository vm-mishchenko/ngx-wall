import { Injectable } from '@angular/core';
import { WallApi } from './wall-api.service';
import { IWallDefinition } from '../../wall.interfaces';
import { WallCoreApi } from './wall-core-api.service';
import { BrickStore } from './brick-store.service';
import { LayoutStore } from './layout-store.service';
import { AddBrickEvent } from './events/add-brick.event';
import { RemoveBrickEvent } from './events/remove-brick.event';

/**
 * @desc Responsible for storing wall state.
 * Provide core functionality
 * */
@Injectable()
export class WallModel {
    get canvasLayout(): boolean {
        return this.layoutStore.canvasLayout;
    }

    focusedBrickId: string = null;

    selectedBricks: string[] = [];

    constructor(public api: WallApi,
                private brickStore: BrickStore,
                private layoutStore: LayoutStore) {
    }

    initialize(plan: IWallDefinition) {
        // initialize core API
        this.api.core = new WallCoreApi(this);

        // protect API from extending
        Object.seal(this.api.core);

        this.brickStore.initialize(plan.bricks);
        this.layoutStore.initialize(plan.layout);
    }

    /* SELECTION API */

    selectBrick(brickId: string): void {
        this.selectedBricks = [brickId];
        this.focusedBrickId = null;
    }

    addBrickToSelection(brickId: string): void {
        this.selectedBricks = this.selectedBricks.splice(0);
        this.selectedBricks.push(brickId);
    }

    removeBrickFromSelection(brickId: string): void {
        const brickIdIndex = this.selectedBricks.indexOf(brickId);

        this.selectedBricks.splice(brickIdIndex, 1);

        this.selectedBricks = this.selectedBricks.splice(0);
    }

    unSelectBricks(): void {
        this.selectedBricks = [];
    }

    // callback for brick selected by user
    onFocusedBrick(brickId: string) {
        this.focusedBrickId = brickId;

        this.unSelectBricks();
    }

    getSelectedBrickIds(): string[] {
        return this.selectedBricks;
    }

    getNextBrickId(brickId: string): string {
        return this.layoutStore.getNextBrickId(brickId);
    }

    getPreviousBrickId(brickId: string) {
        return this.layoutStore.getPreviousBrickId(brickId);
    }

    /* SELECTION API */

    getPlan(): IWallDefinition {
        return {
            bricks: this.brickStore.serialize(),
            layout: this.layoutStore.serialize()
        }
    }

    getBrickStore(brickId: string) {
        return this.brickStore.getBrickStore(brickId);
    }

    turnBrickInto(brickId: string, newTag: string) {
        this.brickStore.turnBrickInto(brickId, newTag);
        this.layoutStore.updateCanvasLayout();

        this.focusOnBrickId(brickId);
    }

    /* Add text brick to the bottom of wall in the new row */
    addDefaultBrick() {
        this.addBrickAtTheEnd('text');
    }

    /* Add brick to existing row and existing column */
    addBrick(tag: string, targetRowIndex: number, targetColumnIndex: number, positionIndex: number) {
        if (this.layoutStore.isColumnExist(targetRowIndex, targetColumnIndex)) {
            const newBrick = this.brickStore.addBrick(tag);

            this.layoutStore.addBrick(newBrick.id, targetRowIndex, targetColumnIndex, positionIndex);

            this.focusOnBrickId(newBrick.id);

            this.api.core.events.next(new AddBrickEvent());
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

        const newBrick = this.brickStore.addBrick(tag);

        this.layoutStore.addBrickToNewRow(newBrick.id, targetRowIndex);

        this.focusOnBrickId(newBrick.id);

        this.api.core.events.next(new AddBrickEvent());
    }

    /* Create new column in existing row and put brick to it */
    addBrickToNewColumn(tag: string, targetRowIndex: number, targetColumnIndex: number) {
        if (this.layoutStore.isRowExists(targetRowIndex)) {
            const totalColumnCount = this.layoutStore.getColumnCount(targetRowIndex);
            const lastColumnIndex = totalColumnCount - 1;

            // user cannot create column in position more than last column index + 1
            if (targetColumnIndex > lastColumnIndex + 1) {
                targetColumnIndex = lastColumnIndex + 1;
            }

            const newBrick = this.brickStore.addBrick(tag);

            this.layoutStore.addBrickToNewColumn(newBrick.id, targetRowIndex, targetColumnIndex);

            this.focusOnBrickId(newBrick.id);

            this.api.core.events.next(new AddBrickEvent());
        }
    }

    addBrickAfterInSameColumn(brickId: string, tag: string) {
        const brickPosition = this.layoutStore.getBrickPositionByBrickId(brickId);

        this.addBrick(tag, brickPosition.rowIndex, brickPosition.columnIndex, brickPosition.brickIndex + 1);
    }

    addBrickAfterInNewRow(brickId: string, tag: string) {
        const brickPosition = this.layoutStore.getBrickPositionByBrickId(brickId);

        this.addBrickToNewRow(tag, brickPosition.rowIndex + 1);
    }

    /*
    * Add brick to the new row in the bottom of whole wall
    * */
    addBrickAtTheEnd(tag: string) {
        const isLastBrickEmptyText = this.isLastBrickEmptyText();

        if (tag === 'text' && isLastBrickEmptyText) {
            this.focusOnBrickId(isLastBrickEmptyText.id);
        } else {
            this.addBrickToNewRow(tag, this.layoutStore.getRowCount());
        }
    }

    removeBrick(brickId: string) {
        const isOnlyOneBrickEmptyText = this.isOnlyOneBrickEmptyText();

        if (isOnlyOneBrickEmptyText) {
            this.focusOnBrickId(isOnlyOneBrickEmptyText.id);
        } else {
            // should find next/prev brick before remove target brick
            const previousTextBrickId = this.layoutStore.getPreviousTextBrick(brickId);
            const nextTextBrickId = this.layoutStore.getNextTextBrick(brickId);

            this.brickStore.removeBrick(brickId);
            this.layoutStore.removeBrick(brickId);

            if (previousTextBrickId) {
                this.focusOnBrickId(previousTextBrickId);
            } else if (nextTextBrickId) {
                this.focusOnBrickId(nextTextBrickId);
            }

            this.api.core.events.next(new RemoveBrickEvent());
        }
    }

    removeBricks(brickIds): void {
        const isOnlyOneBrickEmptyText = this.isOnlyOneBrickEmptyText();

        if (isOnlyOneBrickEmptyText) {
            this.focusOnBrickId(isOnlyOneBrickEmptyText.id);
        } else {
            brickIds = this.layoutStore.sortBrickIds(brickIds);

            // should find next/prev brick before remove target brick
            const previousTextBrickId = this.layoutStore.getPreviousTextBrick(brickIds[0]);
            const nextTextBrickId = this.layoutStore.getNextTextBrick(brickIds[brickIds.length - 1]);

            brickIds.forEach((brickId) => {
                this.brickStore.removeBrick(brickId);
                this.layoutStore.removeBrick(brickId);
            });

            if (previousTextBrickId) {
                this.focusOnBrickId(previousTextBrickId);
            } else if (nextTextBrickId) {
                this.focusOnBrickId(nextTextBrickId);
            } else if (!this.brickStore.getBricksCount()) {
                this.addBrick('text', 0, 0, 0);
            }
        }
    }

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean {
        return this.layoutStore.isBrickAheadOf(firstBrickId, secondBrickId);
    }

    getFocusedBrickId() {
        return this.focusedBrickId;
    }

    focusOnBrickId(brickId: string): void {
        this.focusedBrickId = null;

        // wait until new brick will be rendered
        setTimeout(() => {
            this.focusedBrickId = brickId;
        });
    }

    focusOnPreviousTextBrick(brickId: string) {
        const previousTextBrickId = this.layoutStore.getPreviousTextBrick(brickId);

        if (previousTextBrickId) {
            this.focusOnBrickId(previousTextBrickId);
        }
    }

    focusOnNextTextBrick(brickId: string) {
        const nextTextBrickId = this.layoutStore.getNextTextBrick(brickId);

        if (nextTextBrickId) {
            this.focusOnBrickId(nextTextBrickId);
        }
    }

    private isOnlyOneBrickEmptyText() {
        const brickLength = this.brickStore.getBricksCount();

        return brickLength === 1 ? this.isLastBrickEmptyText() : null;

    }

    // TODO: method should return boolean value
    private isLastBrickEmptyText() {
        const lastBrickId = this.layoutStore.getLastBrickId();

        if (lastBrickId) {
            const lastBrick = this.brickStore.getBrickById(lastBrickId);

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
