import { IWallModel, WallDefinition } from '../wall.interfaces';
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
import { WallLayout } from './wall-layout.model';
import { WallBrick } from './wall-brick.model';
import { IWallColumn, IWallRow } from './model.interfaces';
import { BrickRegistry } from '../registry/brick-registry.service';

export class WallModel implements IWallModel {
    layout: WallLayout;

    private DEFAULT_BRICK = 'text';

    private events: Subject<any> = new Subject();

    constructor(private brickRegistry: BrickRegistry) {
    }

    initialize(plan: WallDefinition) {
        this.layout = new WallLayout(this.brickRegistry);

        plan.layout.bricks.forEach((row, rowIndex) => {
            row.columns.forEach((column, columnIndex) => {
                column.bricks.forEach((brick, brickIndex) => {
                    const planBrick = plan.bricks.find((planBrick) => {
                        return brick.id === planBrick.id;
                    });

                    const wallBrick = this.restoreBrick(planBrick.id, planBrick.tag, planBrick.meta, planBrick.data);

                    // first column in new row
                    if (columnIndex === 0) {
                        if (brickIndex === 0) {
                            this.layout.addBrickToNewRow(rowIndex, wallBrick);
                        } else {
                            this.layout.addBrickToExistingColumn(rowIndex, columnIndex, brickIndex, wallBrick);
                        }
                    } else {
                        if (brickIndex === 0) {
                            this.layout.addBrickToNewColumn(rowIndex, columnIndex, wallBrick);
                        } else {
                            this.layout.addBrickToExistingColumn(rowIndex, columnIndex, brickIndex, wallBrick);
                        }
                    }
                });
            });
        });
    }

    // COMMAND METHODS
    addBrickAfterBrickId(brickId: string, tag: string) {
        const brickPosition = this.layout.getBrickPosition(brickId);
        const columnCount = this.layout.getColumnCount(brickPosition.rowIndex);
        const newBrick = this.createBrick(tag);

        if (columnCount === 1) {
            this.layout.addBrickToNewRow(brickPosition.rowIndex + 1, newBrick);
        } else if (columnCount > 1) {
            this.layout.addBrickToExistingColumn(
                brickPosition.rowIndex,
                brickPosition.columnIndex,
                brickPosition.columnIndex + 1,
                newBrick);
        }

        this.events.next(new AddBrickEvent(newBrick.id));
    }

    // Add text brick to the bottom of wall in the new row
    addDefaultBrick() {
        const brickCount = this.layout.getBrickCount();
        const newBrick = this.createBrick(this.DEFAULT_BRICK);
        const rowIndex = brickCount ? this.layout.getRowCount() + 1 : 0;

        this.layout.addBrickToNewRow(rowIndex, newBrick);
    }

    updateBrickState(brickId, brickState): void {
        const brick = this.layout.getBrickById(brickId);

        brick.updateState(brickState);

        this.events.next(new UpdateBrickStateEvent(brickId, brickState));
    }

    removeBrick(brickId: string): void {
        const nextTextBrick = this.layout.getNextTextBrick(brickId);
        const previousTextBrick = this.layout.getPreviousTextBrick(brickId);

        this.layout.removeBrick(brickId);

        this.events.next(new RemoveBrickEvent(
            brickId,
            previousTextBrick && previousTextBrick.id,
            nextTextBrick && nextTextBrick.id
        ));
    }

    removeBricks(brickIds): void {
        const nextTextBrick = this.layout.getNextTextBrick(brickIds[brickIds.length - 1]);
        const previousTextBrick = this.layout.getPreviousTextBrick(brickIds[0]);

        brickIds.forEach((brickId) => {
            this.layout.removeBrick(brickId);
        });

        this.events.next(new RemoveBricksEvent(
            brickIds,
            previousTextBrick && previousTextBrick.id,
            nextTextBrick && nextTextBrick.id
        ));
    }

    turnBrickInto(brickId: string, newTag: string) {
        const brick = this.layout.getBrickById(brickId);
        const oldTag = brick.tag;

        brick.turnInto(newTag);

        this.events.next(new TurnBrickIntoEvent(brickId, newTag, oldTag));
    }

    moveBrickAfterBrickId(movedBrickIds: string[], afterBrickId: string): void {
        const afterBrickPosition = this.layout.getBrickPosition(afterBrickId);
        const columnCount = this.layout.getColumnCount(afterBrickPosition.rowIndex);

        if (columnCount === 1) {
            this.layout.moveBrickAfterInNewRow(afterBrickId, movedBrickIds);
        } else {
            this.layout.moveBrickAfterInSameColumn(afterBrickId, movedBrickIds);
        }

        this.events.next(new MoveBrickEvent(movedBrickIds, afterBrickId));
    }

    moveBrickBeforeBrickId(movedBrickIds: string[], beforeBrickId: string): void {
        const beforeBrickPosition = this.layout.getBrickPosition(beforeBrickId);
        const columnCount = this.layout.getColumnCount(beforeBrickPosition.rowIndex);

        if (columnCount === 1) {
            this.layout.moveBrickBeforeInNewRow(beforeBrickId, movedBrickIds);
        } else {
            this.layout.moveBrickBeforeInSameColumn(beforeBrickId, movedBrickIds);
        }

        this.events.next(new MoveBrickEvent(movedBrickIds, beforeBrickId));
    }

    moveBrickToNewColumn(targetBrickIds: string[], beforeBrickId: string, side: string): void {
        this.layout.moveBrickToNewColumn(targetBrickIds, beforeBrickId, side);

        this.events.next(new MoveBrickEvent(targetBrickIds, beforeBrickId));
    }

    // QUERY METHODS
    getPlan(): WallDefinition {
        const plan = {
            bricks: [],
            layout: {
                bricks: []
            }
        };

        this.layout.traverse((row: IWallRow) => {
            const columns = [];

            row.columns.forEach((column: IWallColumn) => {
                const planColumn = {
                    bricks: []
                };

                column.bricks.forEach((brick: WallBrick) => {
                    plan.bricks.push({
                        id: brick.id,
                        tag: brick.tag,
                        meta: brick.meta,
                        data: brick.state.getValue()
                    });

                    planColumn.bricks.push({
                        id: brick.id
                    });
                });

                columns.push(planColumn);
            });

            plan.layout.bricks.push({
                columns: columns
            });
        });

        return plan;
    }

    getNextBrickId(brickId: string): string {
        const nextBrick = this.layout.getNextBrick(brickId);

        return nextBrick && nextBrick.id;
    }

    getPreviousBrickId(brickId: string): string {
        const previousBrick = this.layout.getPreviousBrick(brickId);

        return previousBrick && previousBrick.id;
    }

    getNextTextBrickId(brickId: string): string {
        const nextTextBrick = this.layout.getNextTextBrick(brickId);

        return nextTextBrick && nextTextBrick.id;
    }

    getPreviousTextBrickId(brickId: string): string {
        const previousTextBrick = this.layout.getPreviousTextBrick(brickId);

        return previousTextBrick && previousTextBrick.id;
    }

    filterBricks(predictor: Function) {
        return this.layout.filterBricks(predictor);
    }

    traverse(fn: Function) {
        return this.layout.traverse((row: IWallRow) => {
            const preparedRow = {
                columns: row.columns.map((column) => {
                    return {
                        bricks: column.bricks.map((brickConfig) => {
                            return {
                                id: brickConfig.id,
                                tag: brickConfig.tag,
                                state: brickConfig.state
                            }
                        })
                    };
                })
            };

            fn(preparedRow);
        });
    }

    getBrickIds(): string[] {
        return this.layout.getBrickSequence(() => true).map(brick => brick.id)
    }

    getBrickTag(brickId: string): string {
        return this.layout.getBrickById(brickId).tag;
    }

    getBricksCount(): number {
        return this.layout.getBrickCount();
    }

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean {
        return this.layout.isBrickAheadOf(firstBrickId, secondBrickId);
    }

    subscribe(callback: any): Subscription {
        return this.events.subscribe(callback);
    }

    private createBrick(tag) {
        const id = String(Math.random());
        const meta = {};

        return new WallBrick(id, tag, meta);
    }

    private restoreBrick(id, tag, meta, data) {
        const brick = new WallBrick(id, tag, meta);

        brick.updateState(data);

        return brick;
    }
}