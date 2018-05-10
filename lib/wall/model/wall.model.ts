import {Subject, Subscription} from 'rxjs';
import {BrickRegistry} from '../registry/brick-registry.service';
import {IWallDefinition} from '../wall.interfaces';
import {IWallColumn, IWallModel, IWallRow} from './model.interfaces';
import {WallBrick} from './wall-brick.model';
import {WallLayout} from './wall-layout.model';
import {
    AddBrickEvent,
    BeforeChangeEvent,
    IBrickSnapshot,
    MoveBrickEvent,
    RemoveBrickEvent,
    RemoveBricksEvent,
    SetPlanEvent,
    TurnBrickIntoEvent,
    UpdateBrickStateEvent
} from './wall.events';

export class WallModel implements IWallModel {
    private layout: WallLayout;

    private DEFAULT_BRICK = 'text';

    private events: Subject<any> = new Subject();

    constructor(private brickRegistry: BrickRegistry) {
    }

    // COMMAND METHODS
    setPlan(plan: IWallDefinition) {
        this.dispatch(new BeforeChangeEvent(SetPlanEvent));

        this.layout = new WallLayout(this.brickRegistry);

        plan.layout.bricks.forEach((row, rowIndex) => {
            row.columns.forEach((column, columnIndex) => {
                column.bricks.forEach((brick, brickIndex) => {
                    const planBrick = plan.bricks.find((currentPlanBrick) => {
                        return brick.id === currentPlanBrick.id;
                    });

                    const wallBrick = this.restoreBrick(planBrick.id, planBrick.tag, planBrick.meta, planBrick.data);

                    // first column in new row
                    if (columnIndex === 0) {
                        if (brickIndex === 0) {
                            this.layout.addBrickToNewRow(rowIndex, wallBrick, row.id);
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

        this.dispatch(new SetPlanEvent());
    }

    addBrickAfterBrickId(brickId: string, tag: string, state?: any): IBrickSnapshot {
        this.dispatch(new BeforeChangeEvent(AddBrickEvent));

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

        this.dispatch(new AddBrickEvent(newBrick.id));

        return this.getBrickSnapshot(newBrick.id);
    }

    // Add text brick to the bottom of wall in the new row
    addDefaultBrick() {
        this.dispatch(new BeforeChangeEvent(AddBrickEvent));

        const brickCount = this.layout.getBrickCount();
        const newBrick = this.createBrick(this.DEFAULT_BRICK);
        const rowIndex = brickCount ? this.layout.getRowCount() + 1 : 0;

        this.layout.addBrickToNewRow(rowIndex, newBrick);

        this.dispatch(new AddBrickEvent(newBrick.id));
    }

    addBrickAtStart(tag: string, state?: any): IBrickSnapshot {
        this.dispatch(new BeforeChangeEvent(AddBrickEvent));

        const newBrick = this.createBrick(tag, state);

        this.layout.addBrickToNewRow(0, newBrick);

        this.dispatch(new AddBrickEvent(newBrick.id));

        return this.getBrickSnapshot(newBrick.id);
    }

    updateBrickState(brickId, brickState): void {
        this.dispatch(new BeforeChangeEvent(UpdateBrickStateEvent));

        const brick = this.layout.getBrickById(brickId);

        const oldState = JSON.parse(JSON.stringify(brick.getState()));

        brick.updateState(JSON.parse(JSON.stringify(brickState)));

        this.dispatch(new UpdateBrickStateEvent(
            brickId,
            JSON.parse(JSON.stringify(brick.getState())),
            oldState
        ));
    }

    // todo: should be async operation
    removeBrick(brickId: string): void {
        this.dispatch(new BeforeChangeEvent(RemoveBrickEvent));

        const nextTextBrick = this.layout.getNextTextBrick(brickId);
        const previousTextBrick = this.layout.getPreviousTextBrick(brickId);

        this.clearBrickResources(brickId).then(() => {
        });

        const removedBrick = this.getBrickById(brickId);

        this.layout.removeBrick(brickId);

        this.dispatch(new RemoveBrickEvent(
            {
                id: removedBrick.id,
                tag: removedBrick.tag,
                state: removedBrick.state
            },
            previousTextBrick && previousTextBrick.id,
            nextTextBrick && nextTextBrick.id
        ));
    }

    // todo: should be async operation
    removeBricks(brickIds): void {
        this.dispatch(new BeforeChangeEvent(RemoveBricksEvent));

        const nextTextBrick = this.layout.getNextBrick(brickIds[brickIds.length - 1]);
        const previousBrick = this.layout.getPreviousBrick(brickIds[0]);

        const clearPromises = brickIds.map((brickId) => this.clearBrickResources(brickId));

        Promise.all(clearPromises).then(() => {
        });

        const removedBricks = brickIds.map((brickId) => {
            const removedBrick = this.getBrickById(brickId);

            this.layout.removeBrick(brickId);

            return {
                id: removedBrick.id,
                tag: removedBrick.tag,
                state: removedBrick.state
            };
        });

        this.dispatch(new RemoveBricksEvent(
            removedBricks,
            previousBrick && previousBrick.id,
            nextTextBrick && nextTextBrick.id
        ));
    }

    /**
     * Remove all bricks from layout
     * Clear all bricks external dependencies
     */
    clear(): Promise<any> {
        const brickIds = this.getBrickIds();

        // todo: replace it after removeBricks will be async
        const clearPromises = brickIds.map((brickId) => this.clearBrickResources(brickId));

        return Promise.all(clearPromises).then(() => {
            brickIds.forEach((brickId) => {
                this.layout.removeBrick(brickId);
            });
        });
    }

    turnBrickInto(brickId: string, newTag: string, state: any = {}) {
        this.dispatch(new BeforeChangeEvent(TurnBrickIntoEvent));

        const brick = this.layout.getBrickById(brickId);
        const oldTag = brick.tag;

        brick
            .turnInto(newTag)
            .updateState(state);

        this.dispatch(new TurnBrickIntoEvent(brickId, newTag, oldTag));
    }

    moveBrickAfterBrickId(movedBrickIds: string[], afterBrickId: string): void {
        if (movedBrickIds.indexOf(afterBrickId) === -1) {
            this.dispatch(new BeforeChangeEvent(MoveBrickEvent));

            const afterBrickPosition = this.layout.getBrickPosition(afterBrickId);
            const columnCount = this.layout.getColumnCount(afterBrickPosition.rowIndex);

            if (columnCount === 1) {
                this.layout.moveBrickAfterInNewRow(afterBrickId, movedBrickIds);
            } else {
                this.layout.moveBrickAfterInSameColumn(afterBrickId, movedBrickIds);
            }

            this.dispatch(new MoveBrickEvent(movedBrickIds, afterBrickId));
        }
    }

    moveBrickBeforeBrickId(movedBrickIds: string[], beforeBrickId: string): void {
        if (movedBrickIds.indexOf(beforeBrickId) === -1) {
            this.dispatch(new BeforeChangeEvent(MoveBrickEvent));

            const beforeBrickPosition = this.layout.getBrickPosition(beforeBrickId);
            const columnCount = this.layout.getColumnCount(beforeBrickPosition.rowIndex);

            if (columnCount === 1) {
                this.layout.moveBrickBeforeInNewRow(beforeBrickId, movedBrickIds);
            } else {
                this.layout.moveBrickBeforeInSameColumn(beforeBrickId, movedBrickIds);
            }

            this.dispatch(new MoveBrickEvent(movedBrickIds, beforeBrickId));
        }
    }

    moveBrickToNewColumn(targetBrickIds: string[], beforeBrickId: string, side: string): void {
        if (targetBrickIds.indexOf(beforeBrickId) === -1) {
            this.dispatch(new BeforeChangeEvent(MoveBrickEvent));

            this.layout.moveBrickToNewColumn(targetBrickIds, beforeBrickId, side);

            this.dispatch(new MoveBrickEvent(targetBrickIds, beforeBrickId));
        }
    }

    // QUERY METHODS
    getPlan(): IWallDefinition {
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
                        data: brick.state
                    });

                    planColumn.bricks.push({
                        id: brick.id
                    });
                });

                columns.push(planColumn);
            });

            plan.layout.bricks.push({
                columns,
                id: row.id
            });
        });

        return JSON.parse(JSON.stringify(plan));
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

    sortBrickIdsByLayoutOrder(brickIds: string[]) {
        const bricksSequence = this.layout.getBrickSequence(() => true);

        return bricksSequence
            .filter((brick) => brickIds.indexOf(brick.id) !== -1)
            .map((brick) => brick.id);
    }

    filterBricks(predictor): IBrickSnapshot[] {
        return this.layout.filterBricks((wallBrick) => {
            return predictor(this.createBrickSnapshot(wallBrick));
        });
    }

    traverse(fn): void {
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
                            };
                        })
                    };
                })
            };

            fn(preparedRow);
        });
    }

    getBrickIds(): string[] {
        return this.layout.getBrickSequence(() => true).map((brick) => brick.id);
    }

    getBrickTag(brickId: string): string {
        return this.layout.getBrickById(brickId).tag;
    }

    getBrickSnapshot(brickId: string): IBrickSnapshot {
        const brick = this.getBrickById(brickId);

        return brick ? this.createBrickSnapshot(brick) : null;
    }

    getBrickTextRepresentation(brickId: string): string {
        const brick = this.getBrickById(brickId);

        const brickSpecification = this.brickRegistry.get(brick.tag);

        if (brickSpecification.textRepresentation) {
            const brickTextRepresentation = new brickSpecification.textRepresentation(this.createBrickSnapshot(brick));

            return brickTextRepresentation.getText() || '';
        } else {
            return '';
        }
    }

    getBricksCount(): number {
        return this.layout.getBrickCount();
    }

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean {
        return this.layout.isBrickAheadOf(firstBrickId, secondBrickId);
    }

    subscribe(callback): Subscription {
        return this.events.subscribe(callback);
    }

    private dispatch(e: any): void {
        this.events.next(e);
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

    private clearBrickResources(brickId): Promise<any> {
        const brick = this.getBrickById(brickId);

        const brickSpecification = this.brickRegistry.get(brick.tag);

        if (brickSpecification.destructor) {
            return brickSpecification.destructor(this.createBrickSnapshot(brick));
        } else {
            return Promise.resolve();
        }
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

    private createBrickSnapshot(brick: WallBrick): IBrickSnapshot {
        return {
            id: brick.id,
            tag: brick.tag,
            state: brick.getState()
        };
    }
}
