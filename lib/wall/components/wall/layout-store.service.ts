import {Injectable} from '@angular/core';
import {LayoutDefinition} from './wall.interfaces';
import {BrickRegistry} from '../../registry/brick-registry.service';
import {BrickStore} from './brick-store.service';

@Injectable()
export class LayoutStore {
    constructor(private brickRegistry: BrickRegistry, private brickStore: BrickStore) {

    }

    layout: LayoutDefinition = null;

    canvasLayout: any = {
        bricks: []
    };

    initialize(layout: LayoutDefinition) {
        this.layout = layout;

        this.updateCanvasLayout();
    }

    updateCanvasLayout() {
        this.canvasLayout = {
            bricks: this.layout.bricks.map((row) => {
                return {
                    columns: row.columns.map((column) => {
                        return {
                            bricks: column.bricks.map((brick) => {
                                const brickTag = this.brickStore.getBrickTagById(brick.id);

                                return {
                                    id: brick.id,
                                    component: this.brickRegistry.get(brickTag).component
                                };
                            })
                        }
                    })
                }
            })
        };
    }

    serialize() {
        return this.layout;
    }

    addBrick(brickId: string, targetRowIndex: number, targetColumnIndex: number, positionIndex: number) {
        let row = this.layout.bricks[targetRowIndex];
        let column = row.columns[targetColumnIndex];

        const brick = {
            id: brickId
        };

        column.bricks.splice(positionIndex, 0, brick);

        this.updateCanvasLayout();
    }

    // TODO: remove this method, instead use addBrickToNewRowByBeforeBrickId
    addBrickToNewRow(brickId: string, targetRowIndex: number) {
        this.createNewRow(targetRowIndex);

        this.addBrick(brickId, targetRowIndex, 0, 0);
    }

    addBrickToNewRowByBeforeBrickId(targetBrickId, beforeBrickId) {
        const beforeBrickPosition = this.getBrickPositionByBrickId(beforeBrickId);

        const newRowIndex = beforeBrickPosition.rowIndex + 1;

        this.createNewRow(newRowIndex);

        this.addBrick(targetBrickId, newRowIndex, 0, 0);
    }

    addBrickToNewColumn(brickId: string, targetRowIndex: number, targetColumnIndex: number) {
        this.createNewColumn(targetRowIndex, targetColumnIndex);

        this.addBrick(brickId, targetRowIndex, targetColumnIndex, 0);
    }

    addBrickAfterInSameColumn(siblingBrickId: string, brickId: string) {
        const brickPosition = this.getBrickPositionByBrickId(siblingBrickId);

        this.addBrick(brickId, brickPosition.rowIndex, brickPosition.columnIndex, brickPosition.brickIndex + 1);
    }

    moveBrickAfterInSameColumn(targetBrickId: string, beforeBrickId: string) {
        this.removeBrick(targetBrickId);
        this.addBrickAfterInSameColumn(beforeBrickId, targetBrickId);
    }

    moveBrickToNewColumn(targetBrickId: string, beforeBrickId: string, side: string) {
        this.removeBrick(targetBrickId);

        const beforeBrickPosition = this.getBrickPositionByBrickId(beforeBrickId);

        const rowIndex = beforeBrickPosition.rowIndex;
        let columnIndex;

        if (side === 'left') {
            columnIndex = beforeBrickPosition.columnIndex;
        } else if (side === 'right') {
            columnIndex = beforeBrickPosition.columnIndex + 1;
        }

        this.addBrickToNewColumn(targetBrickId, rowIndex, columnIndex);
    }

    moveBrickAfterInNewRow(targetBrickId: string, beforeBrickId: string) {
        this.removeBrick(targetBrickId);

        this.addBrickToNewRowByBeforeBrickId(targetBrickId, beforeBrickId);
    }

    removeBrick(brickId: string) {
        const brickPosition = this.getBrickPositionByBrickId(brickId);

        const row = this.layout.bricks[brickPosition.rowIndex];
        const column = row.columns[brickPosition.columnIndex];

        // remove brick
        const removedBrick = column.bricks.splice(brickPosition.brickIndex, 1);

        // remove column if there are no bricks inside
        if (column.bricks.length === 0) {
            row.columns.splice(brickPosition.columnIndex, 1);

            // remove row if there are no columns inside
            if (row.columns.length === 0) {
                this.layout.bricks.splice(brickPosition.rowIndex, 1);

                // if there are no rows, create default
                if (this.layout.bricks.length === 0) {
                    this.layout.bricks.push({
                        columns: [{
                            bricks: []
                        }]
                    });
                }
            }
        }

        this.updateCanvasLayout();

        return removedBrick[0];
    }

    getNextBrickId(brickId: string): string {
        const brickSequence = this.getBrickSequence(() => true);

        const currentBrickIndex = brickSequence.indexOf(brickId);

        return brickSequence[currentBrickIndex + 1];
    }

    getPreviousBrickId(brickId: string) {
        const brickSequence = this.getBrickSequence(() => true);

        const currentBrickIndex = brickSequence.indexOf(brickId);

        return brickSequence[currentBrickIndex - 1];
    }

    getPreviousTextBrick(brickId: string): string {
        const previousTextBrick = this.findBrickIdBefore(brickId, (currentBrickId: string) => {
            const brickTag = this.brickStore.getBrickTagById(currentBrickId);

            return this.brickRegistry.get(brickTag).supportText;
        });

        return previousTextBrick || null;
    }

    getNextTextBrick(brickId: string): string {
        const nextTextBrick = this.findBrickIdAfter(brickId, (currentBrickId: string) => {
            const brickTag = this.brickStore.getBrickTagById(currentBrickId);

            return this.brickRegistry.get(brickTag).supportText;
        });

        return nextTextBrick || null;
    }

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean {
        const brickSequence = this.getBrickSequence(() => true);

        return brickSequence.indexOf(firstBrickId) < brickSequence.indexOf(secondBrickId);
    }

    sortBrickIds(brickIds: string[]): string[] {
        return this.getBrickSequence((brickId) => {
            return brickIds.indexOf(brickId) !== -1;
        });
    }

    /*Helpers*/
    isRowExists(targetRowIndex: number): boolean {
        return Boolean(this.layout.bricks[targetRowIndex]);
    }

    isColumnExist(targetRowIndex: number, targetColumnIndex: number): boolean {
        return this.isRowExists(targetRowIndex) && Boolean(this.layout.bricks[targetRowIndex].columns[targetColumnIndex]);
    }

    getRowCount() {
        return this.layout.bricks.length;
    }

    getColumnCount(targetRowIndex: number): number {
        return this.layout.bricks[targetRowIndex].columns.length;
    }

    getLastBrickId() {
        const lastRow = this.layout.bricks[this.layout.bricks.length - 1];

        if (lastRow.columns.length === 1) {
            const lastBrick = lastRow.columns[0].bricks[lastRow.columns[0].bricks.length - 1];

            return lastBrick && lastBrick.id;
        } else {
            return null;
        }
    }

    getBrickPositionByBrickId(brickId: string) {
        const brickPosition = {
            rowIndex: null,
            columnIndex: null,
            brickIndex: null
        };

        let i = 0;

        while (brickPosition.rowIndex === null && i < this.layout.bricks.length) {
            this.layout.bricks[i].columns.forEach((column, columnIndex) => {
                let brickIndex = null;

                column.bricks.forEach((brick, index) => {
                    if (brick.id === brickId) {
                        brickIndex = index;
                    }
                });

                if (brickIndex || brickIndex === 0) {
                    brickPosition.rowIndex = i;
                    brickPosition.columnIndex = columnIndex;
                    brickPosition.brickIndex = brickIndex;
                }
            });

            i++;
        }

        return brickPosition;
    }

    private createNewRow(targetRowIndex: number): void {
        this.layout.bricks.splice(targetRowIndex, 0, this.initializeNewRow());
    }

    private createNewColumn(targetRowIndex: number, targetColumnIndex: number): void {
        this.layout.bricks[targetRowIndex].columns.splice(targetColumnIndex, 0, this.initializeNewColumn());
    }

    private initializeNewRow() {
        return {
            columns: [
                this.initializeNewColumn()
            ]
        };
    }

    private initializeNewColumn() {
        return {
            bricks: []
        }
    }

    private getBrickSequence(predicate: Function): string[] {
        const brickSequence = [];

        this.layout.bricks.forEach((row) => {
            row.columns.forEach((column) => {
                column.bricks.forEach((brick) => {
                    if (predicate(brick.id)) {
                        brickSequence.push(brick.id);
                    }
                });
            });
        });

        return brickSequence;
    }

    private findBrickIdBefore(brickId: string, predicate: Function) {
        const brickSequence = this.getBrickSequence(() => true);

        const currentBrickIdIndex = brickSequence.indexOf(brickId);

        if (currentBrickIdIndex !== -1) {
            const brickIdsBefore = brickSequence.splice(0, currentBrickIdIndex);

            brickIdsBefore.reverse();

            for (let i = 0; i < brickIdsBefore.length; i++) {
                if (predicate(brickIdsBefore[i])) {
                    return brickIdsBefore[i];
                }
            }
        }

        return null;
    }

    private findBrickIdAfter(brickId: string, predicate: Function) {
        const brickSequence = this.getBrickSequence(() => true);

        const currentBrickIdIndex = brickSequence.indexOf(brickId);

        if (currentBrickIdIndex !== -1) {
            const brickIdsAfter = brickSequence.splice(currentBrickIdIndex + 1);

            for (let i = 0; i < brickIdsAfter.length; i++) {
                if (predicate(brickIdsAfter[i])) {
                    return brickIdsAfter[i];
                }
            }
        }

        return null;
    }
}