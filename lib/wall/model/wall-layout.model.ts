import { WallBrick } from './wall-brick.model';
import { IWallColumn, IWallRow } from './model.interfaces';
import { BrickRegistry } from '../registry/brick-registry.service';

export class WallLayout {
    private rows: IWallRow[] = [];

    constructor(private brickRegistry: BrickRegistry) {
    }

    // create new row and one column inside
    addBrickToNewRow(rowIndex: number, brick: WallBrick) {
        const totalRowCount = this.rows.length;
        const lastRowIndex = totalRowCount - 1;

        // user cannot create row in position more than last row index + 1
        if (rowIndex > (lastRowIndex + 1)) {
            rowIndex = lastRowIndex + 1;
        }

        this.createNewRow(rowIndex);

        this.addBrick(rowIndex, 0, 0, brick);
    }

    // add only in already existing row and column
    addBrickToExistingColumn(rowIndex: number, columnIndex: number, brickIndex: number, brick: WallBrick) {
        const column = this.getColumn(rowIndex, columnIndex);

        if (column) {
            const bricksCount = column.bricks.length;

            // user cannot put brick in position more than total brick count + 1
            if (brickIndex > (bricksCount + 1)) {
                brickIndex = bricksCount + 1;
            }

            this.addBrick(rowIndex, columnIndex, brickIndex, brick);
        }
    }

    // create new column in existing row
    addBrickToNewColumn(rowIndex, columnIndex, brick: WallBrick) {
        const row = this.rows[rowIndex];

        if (row) {
            const columnCount = row.columns.length;

            // user cannot create column in position more than total column cound + 1
            if (columnIndex > (columnCount + 1)) {
                columnIndex = columnCount + 1;
            }

            this.createNewColumn(rowIndex, columnIndex);

            this.addBrick(rowIndex, columnIndex, 0, brick);
        }
    }

    moveBrickAfterInNewRow(afterBrickId: string, movedBrickIds: string[]): void {
        movedBrickIds.reverse();

        movedBrickIds.forEach((movedBrickId) => {
            const currentMovedBrick = this.getBrickById(movedBrickId);

            this.removeBrick(movedBrickId);

            const afterBrickPosition = this.getBrickPosition(afterBrickId);

            const newRowIndex = afterBrickPosition.rowIndex + 1;

            this.addBrickToNewRow(newRowIndex, currentMovedBrick);
        });
    }

    moveBrickAfterInSameColumn(afterBrickId: string, movedBrickIds: string[]): void {
        movedBrickIds.forEach((movedBrickId) => {
            const currentMovedBrick = this.getBrickById(movedBrickId);

            this.removeBrick(movedBrickId);

            const afterBrickPosition = this.getBrickPosition(afterBrickId);

            this.addBrickToExistingColumn(
                afterBrickPosition.rowIndex,
                afterBrickPosition.columnIndex,
                afterBrickPosition.brickIndex + 1,
                currentMovedBrick);
        });
    }

    moveBrickBeforeInNewRow(beforeBrickId: string, movedBrickIds: string[]): void {
        movedBrickIds.reverse();

        movedBrickIds.forEach((movedBrickId, index) => {
            const currentMovedBrick = this.getBrickById(movedBrickId);

            this.removeBrick(movedBrickId);

            let beforeBrickPosition;

            if (index === 0) {
                beforeBrickPosition = this.getBrickPosition(beforeBrickId);
            } else {
                beforeBrickPosition = this.getBrickPosition(movedBrickIds[index - 1]);
            }

            this.addBrickToNewRow(beforeBrickPosition.rowIndex, currentMovedBrick);
        });
    }

    moveBrickBeforeInSameColumn(beforeBrickId: string, movedBrickIds: string[]): void {
        movedBrickIds.forEach((movedBrickId) => {
            const currentMovedBrick = this.getBrickById(movedBrickId);

            this.removeBrick(movedBrickId);

            const beforeBrickPosition = this.getBrickPosition(beforeBrickId);

            this.addBrickToExistingColumn(
                beforeBrickPosition.rowIndex,
                beforeBrickPosition.columnIndex,
                beforeBrickPosition.brickIndex,
                currentMovedBrick);
        });
    }

    moveBrickToNewColumn(movedBrickIds, beforeBrickId, side): void {
        const movedBricks = movedBrickIds.map((movedBrickId) => {
            const currentMovedBrick = this.getBrickById(movedBrickId);

            this.removeBrick(movedBrickId);

            return currentMovedBrick;
        });

        const beforeBrickPosition = this.getBrickPosition(beforeBrickId);

        let columnIndex;

        if (side === 'left') {
            columnIndex = beforeBrickPosition.columnIndex;
        } else if (side === 'right') {
            columnIndex = beforeBrickPosition.columnIndex + 1;
        }

        movedBricks.forEach((movedBrick, index) => {
            if (index === 0) {
                this.addBrickToNewColumn(
                    beforeBrickPosition.rowIndex,
                    columnIndex,
                    movedBrick
                );
            } else {
                this.addBrickToExistingColumn(
                    beforeBrickPosition.rowIndex,
                    columnIndex,
                    index,
                    movedBrick
                );
            }
        });
    }

    removeBrick(brickId: string): void {
        const brickPosition = this.getBrickPosition(brickId);

        const row = this.rows[brickPosition.rowIndex];
        const column = row.columns[brickPosition.columnIndex];

        // remove brick
        column.bricks.splice(brickPosition.brickIndex, 1);

        // remove column if there are no bricks inside
        if (column.bricks.length === 0) {
            row.columns.splice(brickPosition.columnIndex, 1);

            // remove row if there are no columns inside
            if (row.columns.length === 0) {
                this.rows.splice(brickPosition.rowIndex, 1);

                // if there are no rows, create default
                if (this.rows.length === 0) {
                    this.rows.push({
                        columns: [{
                            bricks: []
                        }]
                    });
                }
            }
        }
    }

    // QUERY METHODS

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean {
        const brickIdsSequence = this.getBrickSequence(() => true).map((brick) => brick.id);

        return brickIdsSequence.indexOf(firstBrickId) < brickIdsSequence.indexOf(secondBrickId);
    }

    getBrickById(brickId: string): WallBrick {
        return this.getBrickSequence((brick: WallBrick) => {
            return brick.id === brickId;
        })[0];
    }

    traverse(fn: Function) {
        this.rows.forEach((row) => {
            fn(row);
        });
    }

    getBrickPosition(brickId: string) {
        const brickPosition = {
            rowIndex: null,
            columnIndex: null,
            brickIndex: null
        };

        let i = 0;

        while (brickPosition.rowIndex === null && i < this.rows.length) {
            this.rows[i].columns.forEach((column, columnIndex) => {
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

    getRowCount() {
        return this.rows.length;
    }

    getColumnCount(rowIndex: number): number {
        return this.rows[rowIndex].columns.length;
    }

    getBrickCount(): number {
        return this.getBrickSequence(() => true).length;
    }

    getNextTextBrick(brickId: string): WallBrick {
        const nextTextBricks = this.findBrickAfter(brickId, (currentBrick: WallBrick) => {
            return this.brickRegistry.get(currentBrick.tag).supportText;
        });

        return nextTextBricks[0];
    }

    getPreviousTextBrick(brickId: string): WallBrick {
        const previousTextBricks = this.findBrickBefore(brickId, (currentBrick: WallBrick) => {
            return this.brickRegistry.get(currentBrick.tag).supportText;
        });

        return previousTextBricks[previousTextBricks.length - 1];
    }

    getNextBrick(brickId: string): WallBrick {
        const bricksSequence = this.getBrickSequence(() => true);

        const brickIndex = bricksSequence.findIndex((brick) => {
            return brick.id === brickId;
        });

        return bricksSequence[brickIndex + 1];
    }

    getPreviousBrick(brickId: string): WallBrick {
        const bricksSequence = this.getBrickSequence(() => true);

        const brickIndex = bricksSequence.findIndex((brick) => {
            return brick.id === brickId;
        });

        return bricksSequence[brickIndex - 1];
    }

    getBrickSequence(predicate: Function): WallBrick[] {
        const brickSequence = [];

        this.traverse((row: IWallRow) => {
            row.columns.forEach((column) => {
                column.bricks.forEach((brick) => {
                    if (predicate(brick)) {
                        brickSequence.push(brick);
                    }
                });
            });
        });

        return brickSequence;
    }

    // COMMANDS
    private addBrick(rowIndex, columnIndex, brickIndex, brick) {
        this.rows[rowIndex].columns[columnIndex].bricks.splice(brickIndex, 0, brick);
    }

    private getColumn(rowIndex: number, columnIndex: number): IWallColumn {
        const row = this.rows[rowIndex];

        if (row) {
            return row.columns[columnIndex];
        } else {
            return null;
        }
    }

    private createNewRow(rowIndex: number): void {
        this.rows.splice(rowIndex, 0, this.initializeNewRow());
    }

    private createNewColumn(rowIndex: number, columnIndex: number): void {
        this.rows[rowIndex].columns.splice(columnIndex, 0, this.initializeNewColumn());
    }

    private initializeNewRow(): IWallRow {
        return {
            columns: [
                this.initializeNewColumn()
            ]
        };
    }

    private initializeNewColumn(): IWallColumn {
        return {
            bricks: []
        }
    }

    private findBrickAfter(brickId: string, predicate: Function) {
        const bricks = [];

        const bricksSequence = this.getBrickSequence(() => true);

        const brickIdsSequence = bricksSequence.map((brick) => brick.id);

        const currentBrickIdIndex = brickIdsSequence.indexOf(brickId);

        if (currentBrickIdIndex !== -1) {
            const brickIdsAfter = brickIdsSequence.splice(currentBrickIdIndex + 1);

            for (let i = 0; i < brickIdsAfter.length; i++) {
                const currentBrick = bricksSequence.find((brick) => {
                    return brick.id === brickIdsAfter[i];
                });

                if (predicate(currentBrick)) {
                    bricks.push(currentBrick);
                }
            }
        }

        return bricks;
    }

    private findBrickBefore(brickId: string, predicate: Function) {
        const bricks = [];

        const bricksSequence = this.getBrickSequence(() => true);

        const brickIdsSequence = bricksSequence.map((brick) => brick.id);

        const currentBrickIdIndex = brickIdsSequence.indexOf(brickId);

        if (currentBrickIdIndex !== -1) {
            const brickIdsBefore = brickIdsSequence.splice(0, currentBrickIdIndex);

            for (let i = 0; i < brickIdsBefore.length; i++) {
                const currentBrick = bricksSequence.find((brick) => {
                    return brick.id === brickIdsBefore[i];
                });

                if (predicate(currentBrick)) {
                    bricks.push(currentBrick);
                }
            }
        }

        return bricks;
    }
}