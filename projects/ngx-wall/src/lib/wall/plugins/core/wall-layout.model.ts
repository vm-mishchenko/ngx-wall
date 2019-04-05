import {Guid} from '../../../modules/utils/utils';
import {BrickRegistry} from '../../registry/public_api';
import {WallBrick} from '../../model/wall-brick.model';
import {IWallColumn} from '../../model/interfaces/wall-column.interface';
import {IWallRow} from '../../model/interfaces/wall-row.interface';
import {LayoutWalker} from './layout-walker.class';

/*
* Modify layout wall rows
* */
export class WallLayout {
    rows: IWallRow[] = [];

    constructor(private brickRegistry: BrickRegistry, private layoutWalker: LayoutWalker) {
    }

    // create new row and one column inside
    addBrickToNewRow(rowIndex: number, brick: WallBrick, rowId?: string) {
        const totalRowCount = this.rows.length;
        const lastRowIndex = totalRowCount - 1;

        // user cannot create row in position more than last row index + 1
        // todo: remove helper checks, lets face the problem earlier
        if (rowIndex > (lastRowIndex + 1)) {
            rowIndex = lastRowIndex + 1;
        }

        this.createNewRow(rowIndex, rowId || this.generateId());

        this.addBrick(rowIndex, 0, 0, brick);
    }

    // add only in already existing row and column
    addBrickToExistingColumn(rowIndex: number, columnIndex: number, brickIndex: number, brick: WallBrick) {
        const column = this.getColumn(rowIndex, columnIndex);

        if (column) {
            const bricksCount = column.bricks.length;

            // user cannot put brick in position more than total brick count + 1
            // todo: remove helper checks, lets face the problem earlier
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
            // todo: remove helper checks, lets face the problem earlier
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
            const currentMovedBrick = this.layoutWalker.getBrickById(movedBrickId);

            this.removeBrick(movedBrickId);

            const afterBrickPosition = this.layoutWalker.getBrickPosition(afterBrickId);

            const newRowIndex = afterBrickPosition.rowIndex + 1;

            this.addBrickToNewRow(newRowIndex, currentMovedBrick);
        });
    }

    moveBrickAfterInSameColumn(afterBrickId: string, movedBrickIds: string[]): void {
        movedBrickIds.forEach((movedBrickId, index) => {
            const currentMovedBrick = this.layoutWalker.getBrickById(movedBrickId);

            this.removeBrick(movedBrickId);

            const afterBrickPosition = this.layoutWalker.getBrickPosition(afterBrickId);

            this.addBrickToExistingColumn(
                afterBrickPosition.rowIndex,
                afterBrickPosition.columnIndex,
                afterBrickPosition.brickIndex + index + 1,
                currentMovedBrick);
        });
    }

    moveBrickBeforeInNewRow(beforeBrickId: string, movedBrickIds: string[]): void {
        movedBrickIds.reverse();

        movedBrickIds.forEach((movedBrickId, index) => {
            const currentMovedBrick = this.layoutWalker.getBrickById(movedBrickId);

            this.removeBrick(movedBrickId);

            let beforeBrickPosition;

            if (index === 0) {
                beforeBrickPosition = this.layoutWalker.getBrickPosition(beforeBrickId);
            } else {
                beforeBrickPosition = this.layoutWalker.getBrickPosition(movedBrickIds[index - 1]);
            }

            this.addBrickToNewRow(beforeBrickPosition.rowIndex, currentMovedBrick);
        });
    }

    moveBrickBeforeInSameColumn(beforeBrickId: string, movedBrickIds: string[]): void {
        movedBrickIds.forEach((movedBrickId) => {
            const currentMovedBrick = this.layoutWalker.getBrickById(movedBrickId);

            this.removeBrick(movedBrickId);

            const beforeBrickPosition = this.layoutWalker.getBrickPosition(beforeBrickId);

            this.addBrickToExistingColumn(
                beforeBrickPosition.rowIndex,
                beforeBrickPosition.columnIndex,
                beforeBrickPosition.brickIndex,
                currentMovedBrick);
        });
    }

    moveBrickToNewColumn(movedBrickIds, beforeBrickId, side): void {
        const movedBricks = movedBrickIds.map((movedBrickId) => {
            const currentMovedBrick = this.layoutWalker.getBrickById(movedBrickId);

            this.removeBrick(movedBrickId);

            return currentMovedBrick;
        });

        const beforeBrickPosition = this.layoutWalker.getBrickPosition(beforeBrickId);

        let columnIndex;

        // todo: move side to constant
        // todo: search across project for all hard coded variables
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
        const brickPosition = this.layoutWalker.getBrickPosition(brickId);

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
                    this.rows.push(this.initializeNewRow(this.generateId()));
                }
            }
        }
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

    private createNewRow(rowIndex: number, rowId: string): void {
        this.rows.splice(rowIndex, 0, this.initializeNewRow(rowId));
    }

    private createNewColumn(rowIndex: number, columnIndex: number): void {
        this.rows[rowIndex].columns.splice(columnIndex, 0, this.initializeNewColumn());
    }

    private initializeNewRow(rowId: string): IWallRow {
        return {
            id: rowId,
            columns: [
                this.initializeNewColumn()
            ]
        };
    }

    private initializeNewColumn(): IWallColumn {
        return {
            bricks: []
        };
    }

    private generateId(): string {
        return (new Guid()).get();
    }
}
