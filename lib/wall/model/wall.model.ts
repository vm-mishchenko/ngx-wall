import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { BrickRegistry } from '../registry/brick-registry.service';
import { IWallModel, WallDefinition } from '../wall.interfaces';
import { IWallColumn, IWallRow } from './model.interfaces';
import { WallBrick } from './wall-brick.model';
import { WallLayout } from './wall-layout.model';
import {
    AddBrickEvent, BrickSnapshot, MoveBrickEvent, RemoveBrickEvent, RemoveBricksEvent, TurnBrickIntoEvent,
    UpdateBrickStateEvent
} from './wall.events';

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
    addBrickAfterBrickId(brickId: string, tag: string, state?: any) {
        const brickPosition = this.layout.getBrickPosition(brickId);
        const columnCount = this.layout.getColumnCount(brickPosition.rowIndex);
        const newBrick = this.createBrick(tag, state);

        if (columnCount === 1) {
            this.layout.addBrickToNewRow(brickPosition.rowIndex + 1, newBrick);
        } else if (columnCount > 1) {
            this.layout.addBrickToExistingColumn(
                brickPosition.rowIndex,
                brickPosition.columnIndex,
                brickPosition.brickIndex + 1,
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

        this.events.next(new AddBrickEvent(newBrick.id));
    }

    updateBrickState(brickId, brickState): void {
        const brick = this.layout.getBrickById(brickId);

        brick.updateState(brickState);

        this.events.next(new UpdateBrickStateEvent(brickId, brickState));
    }

    removeBrick(brickId: string): void {
        const nextTextBrick = this.layout.getNextTextBrick(brickId);
        const previousTextBrick = this.layout.getPreviousTextBrick(brickId);

        const removedBrick = this.getBrickById(brickId);

        this.layout.removeBrick(brickId);

        this.events.next(new RemoveBrickEvent(
            {
                id: removedBrick.id,
                tag: removedBrick.tag,
                state: removedBrick.state.getValue()
            },
            previousTextBrick && previousTextBrick.id,
            nextTextBrick && nextTextBrick.id
        ));
    }

    removeBricks(brickIds): void {
        const nextTextBrick = this.layout.getNextTextBrick(brickIds[brickIds.length - 1]);
        const previousTextBrick = this.layout.getPreviousTextBrick(brickIds[0]);

        const removedBricks = brickIds.map((brickId) => {
            const removedBrick = this.getBrickById(brickId);

            this.layout.removeBrick(brickId);

            return {
                id: removedBrick.id,
                tag: removedBrick.tag,
                state: removedBrick.state.getValue()
            };
        });

        this.events.next(new RemoveBricksEvent(
            removedBricks,
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

    getRowCount(): number {
        return this.layout.getRowCount();
    }

    getColumnCount(rowIndex: number): number {
        return this.layout.getColumnCount(rowIndex);
    }

    getNextBrickId(brickId: string): string {
        const nextBrick = this.layout.getNextBrick(brickId);

        return nextBrick && nextBrick.id;
    }

    getPreviousBrickId(brickId: string): string {
        // todo: layout should not care about supportText registry flag
        const previousBrick = this.layout.getPreviousBrick(brickId);

        return previousBrick && previousBrick.id;
    }

    getNextTextBrickId(brickId: string): string {
        // todo: layout should not care about supportText registry flag
        const nextTextBrick = this.layout.getNextTextBrick(brickId);

        return nextTextBrick && nextTextBrick.id;
    }

    getPreviousTextBrickId(brickId: string): string {
        const previousTextBrick = this.layout.getPreviousTextBrick(brickId);

        return previousTextBrick && previousTextBrick.id;
    }

    filterBricks(predictor: Function): BrickSnapshot[] {
        return this.layout.filterBricks((wallBrick) => {
            return predictor(this.createBrickSnapshot(wallBrick));
        });
    }

    traverse(fn: Function): void {
        return this.layout.traverse((row: IWallRow) => {
            const preparedRow = {
                id: row.id,
                
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

    getBrickSnapshot(brickId: string): BrickSnapshot {
        const brick = this.getBrickById(brickId);

        return this.createBrickSnapshot(brick);
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

    private getBrickById(brickId: string): WallBrick {
        return this.layout.getBrickById(brickId);
    }

    private createBrick(tag, state?: any) {
        const id = this.generateGuid();
        const meta = {};
        const brick = new WallBrick(id, tag, meta);

        if (state) {
            brick.updateState(state);
        }

        return brick;
    }

    private restoreBrick(id, tag, meta, data) {
        const brick = new WallBrick(id, tag, meta);

        brick.updateState(data);

        return brick;
    }

    private generateGuid(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    private createBrickSnapshot(brick: WallBrick): BrickSnapshot {
        return {
            id: brick.id,
            tag: brick.tag,
            state: brick.state.getValue()
        };
    }
}