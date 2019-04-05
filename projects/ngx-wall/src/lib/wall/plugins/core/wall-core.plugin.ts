import {Subject, Subscription} from 'rxjs';
import {Guid} from '../../../modules/utils/utils';
import {IBrickDefinition} from '../../model/interfaces/brick-definition.interface';
import {IWallColumn} from '../../model/interfaces/wall-column.interface';
import {IWallDefinition} from '../../model/interfaces/wall-definition.interface';
import {IWallRow} from '../../model/interfaces/wall-row.interface';
import {WallBrick} from '../../model/wall-brick.model';
import {BrickRegistry} from '../../registry/brick-registry.service';
import {AddBrickEvent} from './events/add-brick.event';
import {BeforeChangeEvent} from './events/before-change.event';
import {MoveBrickEvent} from './events/move-brick.event';
import {RemoveBrickEvent} from './events/remove-brick.event';
import {RemoveBricksEvent} from './events/remove-bricks.event';
import {SetPlanEvent} from './events/set-plan.event';
import {TurnBrickIntoEvent} from './events/turn-brick-into.event';
import {UpdateBrickStateEvent} from './events/update-brick-state.event';
import {LayoutWalker} from './layout-walker.class';
import {WallLayout} from './wall-layout.model';
import {IWallPlugin} from '../../model/interfaces/wall-plugin.interface';
import {IWallModel} from '../../model/interfaces/wall-model.interface';
import {IBrickSnapshot} from '../../model/interfaces/brick-snapshot.interface';

/*
* Contains Wall data structure and registers API for data manipulation.
* Responsible to IWallDefinition->Layout and Layout->IWallDefinition transformation
* */
export class WallCorePlugin implements IWallPlugin {
    name = 'core';
    version = '0.0.0';

    // sub plugins
    private layout: WallLayout;
    private layoutWalker: LayoutWalker = new LayoutWalker(this.brickRegistry);

    private wallModel: IWallModel;

    private DEFAULT_BRICK = 'text';

    private events: Subject<any> = new Subject();

    constructor(private brickRegistry: BrickRegistry) {
    }

    // START API

    onWallInitialize(wallModel: IWallModel) {
        this.wallModel = wallModel;

        [
            'getRowCount',
            'getBrickTag',
            'getPreviousBrickId',
            'getNextBrickId',
            'getColumnCount',
            'getBrickIds',
            'getBricksCount',
            'getNextTextBrickId',
            'getPreviousTextBrickId',
            'filterBricks',
            'isBrickAheadOf'
        ].forEach((methodName) => {
            this[methodName] = this.layoutWalker[methodName].bind(this.layoutWalker);
        });

        this.wallModel.registerApi(this.name, this);
    }

    // old

    // COMMAND METHODS
    setPlan(plan: IWallDefinition) {
        this.dispatch(new BeforeChangeEvent(SetPlanEvent));

        this.layout = new WallLayout(this.brickRegistry, this.layoutWalker);

        this.layoutWalker.setLayout(this.layout.rows);

        // build tree
        plan.layout.bricks.forEach((row, rowIndex) => {
            row.columns.forEach((column, columnIndex) => {
                column.bricks.forEach((brick, brickIndex) => {
                    const planBrick = plan.bricks.find((currentPlanBrick) => {
                        return brick.id === currentPlanBrick.id;
                    });

                    const wallBrick = this.restoreBrick(planBrick);

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

        const brickPosition = this.layoutWalker.getBrickPosition(brickId);
        const columnCount = this.layoutWalker.getColumnCount(brickPosition.rowIndex);
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

    addBrickBeforeBrickId(brickId: string, tag: string, state?: any): IBrickSnapshot {
        this.dispatch(new BeforeChangeEvent(AddBrickEvent));

        const brickPosition = this.layoutWalker.getBrickPosition(brickId);
        const columnCount = this.layoutWalker.getColumnCount(brickPosition.rowIndex);
        const newBrick = this.createBrick(tag, state);

        if (columnCount === 1) {
            this.layout.addBrickToNewRow(brickPosition.rowIndex, newBrick);
        } else if (columnCount > 1) {
            this.layout.addBrickToExistingColumn(
                brickPosition.rowIndex,
                brickPosition.columnIndex,
                brickPosition.brickIndex,
                newBrick);
        }

        this.dispatch(new AddBrickEvent(newBrick.id));

        return this.getBrickSnapshot(newBrick.id);
    }

    // Add text brick to the bottom of wall in the new row
    addDefaultBrick() {
        this.dispatch(new BeforeChangeEvent(AddBrickEvent));

        const brickCount = this.layoutWalker.getBricksCount();
        const newBrick = this.createBrick(this.DEFAULT_BRICK);
        const rowIndex = brickCount ? this.layoutWalker.getRowCount() + 1 : 0;

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

        const brick = this.layoutWalker.getBrickById(brickId);

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

        const nextTextBrick = this.layoutWalker.getNextTextBrick(brickId);
        const previousTextBrick = this.layoutWalker.getPreviousTextBrick(brickId);

        this.clearBrickResources(brickId).then(() => {
        });

        const removedBrick = this.layoutWalker.getBrickById(brickId);

        this.layout.removeBrick(brickId);

        this.dispatch(new RemoveBrickEvent(
            removedBrick.getSnapshot(),
            previousTextBrick && previousTextBrick.id,
            nextTextBrick && nextTextBrick.id
        ));
    }

    // todo: should be async operation
    removeBricks(brickIds): void {
        this.dispatch(new BeforeChangeEvent(RemoveBricksEvent));

        const nextTextBrick = this.layoutWalker.getNextBrick(brickIds[brickIds.length - 1]);
        const previousBrick = this.layoutWalker.getPreviousBrick(brickIds[0]);

        const clearPromises = brickIds.map((brickId) => this.clearBrickResources(brickId));

        Promise.all(clearPromises).then(() => {
        });

        const removedBricks = brickIds.map((brickId) => {
            const removedBrick = this.layoutWalker.getBrickById(brickId);

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
        const brickIds = this.layoutWalker.getBrickIds();

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

        const brick = this.layoutWalker.getBrickById(brickId);
        const oldTag = brick.tag;

        brick
            .turnInto(newTag)
            .updateState(state);

        this.dispatch(new TurnBrickIntoEvent(brickId, newTag, oldTag));
    }

    moveBrickAfterBrickId(movedBrickIds: string[], afterBrickId: string): void {
        if (movedBrickIds.indexOf(afterBrickId) === -1) {
            this.dispatch(new BeforeChangeEvent(MoveBrickEvent));

            const afterBrickPosition = this.layoutWalker.getBrickPosition(afterBrickId);
            const columnCount = this.layoutWalker.getColumnCount(afterBrickPosition.rowIndex);

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

            const beforeBrickPosition = this.layoutWalker.getBrickPosition(beforeBrickId);
            const columnCount = this.layoutWalker.getColumnCount(beforeBrickPosition.rowIndex);

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

        this.layoutWalker.traverse((row: IWallRow) => {
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

    sortBrickIdsByLayoutOrder(brickIds: string[]) {
        const bricksSequence = this.layoutWalker.getBrickSequence(() => true);

        return bricksSequence
            .filter((brick) => brickIds.indexOf(brick.id) !== -1)
            .map((brick) => brick.id);
    }

    traverse(fn): void {
        return this.layoutWalker.traverse((row: IWallRow) => {
            const preparedRow = {
                id: row.id,

                columns: row.columns.map((column) => {
                    return {
                        bricks: column.bricks.map((brick) => brick.getSnapshot())
                    };
                })
            };

            fn(preparedRow);
        });
    }

    getBrickSnapshot(brickId: string): IBrickSnapshot {
        const brick = this.layoutWalker.getBrickById(brickId);

        return brick ? brick.getSnapshot() : null;
    }

    getBrickResourcePaths(brickId: string): string[] {
        const brick = this.layoutWalker.getBrickById(brickId);

        const brickSpecification = this.brickRegistry.get(brick.tag);

        if (!brickSpecification.getBrickResourcePaths) {
            return [];
        }

        return brickSpecification.getBrickResourcePaths(brick.getSnapshot());
    }

    getBrickTextRepresentation(brickId: string): string {
        const brick = this.layoutWalker.getBrickById(brickId);

        const brickSpecification = this.brickRegistry.get(brick.tag);

        if (brickSpecification.textRepresentation) {
            const brickTextRepresentation = new brickSpecification.textRepresentation(brick.getSnapshot());

            return brickTextRepresentation.getText() || '';
        } else {
            return '';
        }
    }

    subscribe(callback): Subscription {
        return this.events.subscribe(callback);
    }

    isRegisteredBrick(tag: string): boolean {
        return Boolean(this.brickRegistry.get(tag));
    }

    private dispatch(e: any): void {
        this.events.next(e);
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

    private restoreBrick(brickDefinition: IBrickDefinition): WallBrick {
        const brick = new WallBrick(
            brickDefinition.id,
            brickDefinition.tag,
            brickDefinition.meta
        );

        brick.updateState(brickDefinition.data);

        return brick;
    }

    private clearBrickResources(brickId): Promise<any> {
        const brick = this.layoutWalker.getBrickById(brickId);

        const brickSpecification = this.brickRegistry.get(brick.tag);

        if (brickSpecification.destructor) {
            return brickSpecification.destructor(brick.getSnapshot());
        } else {
            return Promise.resolve();
        }
    }

    private generateGuid(): string {
        return (new Guid()).get();
    }
}
