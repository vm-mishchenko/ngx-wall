import {BrickRegistry} from '../../registry/brick-registry.service';
import {WallBrick} from '../../model/wall-brick.model';
import {IWallRow} from '../../model/interfaces/wall-row.interface';
import {IBrickSnapshot} from '../../model/interfaces/brick-snapshot.interface';

/*
* Execute queries commands over rows
* */
export class LayoutWalker {
    rows: IWallRow[] = [];

    constructor(private brickRegistry: BrickRegistry) {
    }

    // public API

    getRowCount() {
        return this.rows.length;
    }

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean {
        const brickIdsSequence = this.getBrickSequence(() => true).map((brick) => brick.id);

        return brickIdsSequence.indexOf(firstBrickId) < brickIdsSequence.indexOf(secondBrickId);
    }

    getBrickTag(brickId: string): string {
        return this.getBrickById(brickId).tag;
    }

    getBrickById(brickId: string): WallBrick {
        return this.getBrickSequence((brick: WallBrick) => {
            return brick.id === brickId;
        })[0];
    }

    getBrickIds(): string[] {
        return this.getBrickSequence(() => true).map((brick) => brick.id);
    }

    filterBricks(predictor: (brick: IBrickSnapshot) => boolean) {
        return this.getBrickSequence((wallBrick) => {
            return predictor(wallBrick.getSnapshot());
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

    getColumnCount(rowIndex: number): number {
        return this.rows[rowIndex].columns.length;
    }

    getBricksCount(): number {
        return this.getBrickSequence(() => true).length;
    }

    getNextBrick(brickId: string): WallBrick {
        const bricksSequence = this.getBrickSequence(() => true);

        const brickIndex = bricksSequence.findIndex((brick) => {
            return brick.id === brickId;
        });

        return bricksSequence[brickIndex + 1];
    }

    getNextBrickId(brickId: string): string {
        const nextBrick = this.getNextBrick(brickId);

        return nextBrick && nextBrick.id;
    }

    getPreviousBrick(brickId: string): WallBrick {
        const bricksSequence = this.getBrickSequence(() => true);

        const brickIndex = bricksSequence.findIndex((brick) => {
            return brick.id === brickId;
        });

        return bricksSequence[brickIndex - 1];
    }

    getPreviousBrickId(brickId: string): string {
        const previousBrick = this.getPreviousBrick(brickId);

        return previousBrick && previousBrick.id;
    }

    getBrickSequence(predicate): WallBrick[] {
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

    getNextTextBrickId(brickId: string): string {
        const nextTextBrick = this.getNextTextBrick(brickId);

        return nextTextBrick && nextTextBrick.id;
    }

    getPreviousTextBrickId(brickId: string): string {
        const previousTextBrick = this.getPreviousTextBrick(brickId);

        return previousTextBrick && previousTextBrick.id;
    }

    // end public API

    getNextTextBrick(brickId: string): WallBrick {
        const nextTextBricks = this.findBricksAfter(brickId, (currentBrick: WallBrick) => {
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

    findBricksAfter(brickId: string, predicate): WallBrick[] {
        const bricks = [];

        const bricksSequence = this.getBrickSequence(() => true);

        const brickIdsSequence = bricksSequence.map((brick) => brick.id);

        const currentBrickIdIndex = brickIdsSequence.indexOf(brickId);

        if (currentBrickIdIndex !== -1) {
            const brickIdsAfter = brickIdsSequence.splice(currentBrickIdIndex + 1);

            brickIdsAfter.forEach((brickIdAfter) => {
                const currentBrick = bricksSequence.find((brick) => {
                    return brick.id === brickIdAfter;
                });

                if (predicate(currentBrick)) {
                    bricks.push(currentBrick);
                }
            });
        }

        return bricks;
    }

    findBrickBefore(brickId: string, predicate) {
        const bricks = [];

        const bricksSequence = this.getBrickSequence(() => true);

        const brickIdsSequence = bricksSequence.map((brick) => brick.id);

        const currentBrickIdIndex = brickIdsSequence.indexOf(brickId);

        if (currentBrickIdIndex !== -1) {
            const brickIdsBefore = brickIdsSequence.splice(0, currentBrickIdIndex);

            brickIdsBefore.forEach((brickIdBefore) => {
                const currentBrick = bricksSequence.find((brick) => brick.id === brickIdBefore);

                if (predicate(currentBrick)) {
                    bricks.push(currentBrick);
                }
            });
        }

        return bricks;
    }

    setLayout(rows: IWallRow[]) {
        this.rows = rows;
    }

    traverse(fn: (row: IWallRow) => void) {
        this.rows.forEach((row) => {
            fn(row);
        });
    }
}
