import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {shareReplay} from 'rxjs/operators';
import {Guid} from '../../../modules/utils/guid';
import {IBrickSnapshot} from '../../model/interfaces/brick-snapshot.interface';
import {IWallDefinition2} from '../../model/interfaces/wall-definition.interface2';
import {IWallModel} from '../../model/interfaces/wall-model.interface';
import {BrickRegistry} from '../../registry/brick-registry.service';
import {IBrickDefinition} from '../../wall';
import {TransactionEvent} from './events';

export const DEFAULT_BRICK = 'text';

interface IPlaneStorageOptions {
    transactionHooks: ITransactionHook[];
}

class PlanStorage {
    private eventsInternal$ = new Subject<any>();

    events$ = this.eventsInternal$.asObservable().pipe(
        shareReplay(1)
    );

    private planBehaviour$: BehaviorSubject<IWallDefinition2> = new BehaviorSubject([]);

    plan$: Observable<IWallDefinition2> = this.planBehaviour$.asObservable().pipe(
        shareReplay(1)
    );

    constructor(readonly brickRegistry: BrickRegistry, private options?: IPlaneStorageOptions) {
    }

    query() {
        return new PlanQuery(this.plan(), this.brickRegistry);
    }

    transaction() {
        return new Transaction(this);
    }

    applyTransaction(transaction: Transaction) {
        if (this.options && this.options.transactionHooks) {
            this.options.transactionHooks.forEach((hook) => {
                hook.apply(transaction);
            });
        }

        this.planBehaviour$.next(transaction.plan);
        this.eventsInternal$.next(new TransactionEvent(transaction));
    }

    private plan() {
        return this.planBehaviour$.getValue();
    }
}

// todo: implement separate class for that interfaces
export interface ITransactionRemovedChange {
    brickSnapshot: IBrickSnapshot;
    nearestBrickId: string | null;
}

export interface ITransactionChanges {
    // completely new plan was set
    planSetTo: IWallDefinition2[];

    // newly added brick ids
    added: string[];

    // moved brick ids
    moved: string[];

    // removed brick ids
    removed: ITransactionRemovedChange[];

    turned: Array<{
        brickId: string,
        previousTag: string,
        newTag: string,
    }>;

    // removed brick ids
    updated: Array<{
        brickId: string;
        previousData: any;
        newData: any;
    }>;
}

interface ITransactionHook {
    apply(transaction: Transaction);
}

export interface ITransactionMetadataItem {
    key: string;
    value: any;
}

export class Transaction {
    // any attached data to current transaction
    // warn: that's currently open property for changes,
    // closed it if there are any other devs except me
    metadata: Map<string, any> = new Map();

    // all changes that were done for current transaction
    private changes: ITransactionChanges[] = [];

    // todo: implement separate class for plan
    private plans: IWallDefinition2[] = [];

    constructor(private planStorage: PlanStorage) {
    }

    get change(): ITransactionChanges {
        const initialChange: ITransactionChanges = {
            planSetTo: [],
            updated: [],
            moved: [],
            removed: [],
            added: [],
            turned: [],
        };

        return this.changes.reduce((result, change) => {
            result = {
                planSetTo: [
                    ...result.planSetTo,
                    ...change.planSetTo
                ],
                removed: [
                    ...result.removed,
                    ...change.removed
                ],
                added: [
                    ...result.added,
                    ...change.added
                ],
                turned: [
                    ...result.turned,
                    ...change.turned
                ],
                updated: [
                    ...result.updated,
                    ...change.updated
                ],
                moved: [
                    ...result.moved,
                    ...change.moved
                ]
            };

            return result;
        }, initialChange);
    }

    get plan(): IWallDefinition2 {
        const last = this.plans.length - 1;
        return last < 0 ? this.planStorage.query().plan : this.plans[last];
    }

    setPlan(plan: IWallDefinition2) {
        this.plans.push(plan);
        this.changes.push({
            planSetTo: [plan],
            added: [],
            turned: [],
            removed: [],
            updated: [],
            moved: [],
        });

        return this;
    }

    apply() {
        this.planStorage.applyTransaction(this);
    }

    query() {
        return new PlanQuery(this.plan, this.planStorage.brickRegistry);
    }

    // SIMPLE LOW LEVEL API
    addBrick(tag: string, position: number, data: any = {}) {
        const brick = this.createNewBrick(tag, data);

        const newPlan = [
            ...this.plan.slice(0, position),
            brick,
            ...this.plan.slice(position)
        ];

        this.plans.push(newPlan);

        this.changes.push({
            added: [brick.id],
            turned: [],
            removed: [],
            updated: [],
            moved: [],
            planSetTo: [],
        });

        return brick.id;
    }

    addBrickBefore(targetBrickId: string, tag: string, data: any = {}) {
        const newBrick = this.createNewBrick(tag, data);
        const targetBrickPosition = this.query().brickPosition(targetBrickId);

        this.plans.push([
            ...this.plan.slice(0, targetBrickPosition),
            newBrick,
            ...this.plan.slice(targetBrickPosition),
        ]);

        this.changes.push({
            planSetTo: [],
            added: [newBrick.id],
            turned: [],
            removed: [],
            updated: [],
            moved: []
        });

        return newBrick.id;
    }

    addBrickAfter(targetBrickId: string, tag: string, data: any = {}) {
        const newBrick = this.createNewBrick(tag, data);
        const targetBrickPosition = this.query().brickPosition(targetBrickId);
        const afterTargetPosition = targetBrickPosition + 1;

        this.plans.push([
            ...this.plan.slice(0, afterTargetPosition),
            newBrick,
            ...this.plan.slice(afterTargetPosition),
        ]);

        this.changes.push({
            planSetTo: [],
            added: [newBrick.id],
            turned: [],
            removed: [],
            updated: [],
            moved: []
        });

        return newBrick.id;
    }

    moveBrickBefore(brickIdsToMove: string | string[], targetBrickId: string) {
        if (!Array.isArray(brickIdsToMove)) {
            brickIdsToMove = [brickIdsToMove];
        }

        const orderedBrickIdsToMove = this.query().sortBrickIdsByLayoutOrder(brickIdsToMove);

        const orderedBricksToMove = orderedBrickIdsToMove.map((orderedBrickIdToMove) => {
            return this.plan.find((brick) => brick.id === orderedBrickIdToMove);
        });

        // new plan without moved brick ids
        let newPlan: IWallDefinition2 = this.plan.filter((brick) => {
            return !brickIdsToMove.includes(brick.id);
        });

        const targetBrickIdPosition = new PlanQuery(newPlan, this.planStorage.brickRegistry).brickPosition(targetBrickId);
        const beforeTargetBrickIdPosition = targetBrickIdPosition;

        newPlan = [
            ...newPlan.slice(0, beforeTargetBrickIdPosition),
            ...orderedBricksToMove,
            ...newPlan.slice(beforeTargetBrickIdPosition)
        ];

        this.plans.push(newPlan);
        this.changes.push({
            planSetTo: [],
            turned: [],
            removed: [],
            updated: [],
            added: [],
            moved: brickIdsToMove
        });

        return this;
    }

    moveBrickAfter(brickIdsToMove: string | string[], targetBrickId: string) {
        if (!Array.isArray(brickIdsToMove)) {
            brickIdsToMove = [brickIdsToMove];
        }

        const orderedBrickIdsToMove = this.query().sortBrickIdsByLayoutOrder(brickIdsToMove);

        const orderedBricksToMove = orderedBrickIdsToMove.map((orderedBrickIdToMove) => {
            return this.plan.find((brick) => brick.id === orderedBrickIdToMove);
        });

        // new plan without moved brick ids
        let newPlan: IWallDefinition2 = this.plan.filter((brick) => {
            return !brickIdsToMove.includes(brick.id);
        });

        const targetBrickIdPosition = new PlanQuery(newPlan, this.planStorage.brickRegistry).brickPosition(targetBrickId);
        const afterTargetBrickIdPosition = targetBrickIdPosition + 1;

        newPlan = [
            ...newPlan.slice(0, afterTargetBrickIdPosition),
            ...orderedBricksToMove,
            ...newPlan.slice(afterTargetBrickIdPosition)
        ];

        this.plans.push(newPlan);
        this.changes.push({
            planSetTo: [],
            turned: [],
            removed: [],
            updated: [],
            added: [],
            moved: brickIdsToMove
        });

        return this;
    }

    updateBrick(brickId: string, data: any) {
        const previousData = this.query().brickSnapshot(brickId).state;
        const newData = {
            ...previousData,
            ...data
        };

        const newPlan = this.plan.map((brick) => {
            if (brick.id !== brickId) {
                return brick;
            }

            return {
                ...brick,
                data: newData
            };
        });

        this.plans.push(newPlan);
        this.changes.push({
            planSetTo: [],
            updated: [{
                brickId,
                newData,
                previousData
            }],
            removed: [],
            turned: [],
            added: [],
            moved: []
        });

        return this;
    }

    removeBrick(brickId: string) {
        const nearestBrickId = this.query().getNextTextBrickId(brickId) || this.query().getPreviousTextBrickId(brickId);
        const brickSnapshot = this.query().brickSnapshot(brickId);

        const newPlan = this.plan.filter((brick) => {
            if (brick.id !== brickId) {
                return brick;
            }
        });

        this.plans.push(newPlan);
        this.changes.push({
            planSetTo: [],
            removed: [{
                brickSnapshot,
                nearestBrickId,
            }],
            added: [],
            turned: [],
            updated: [],
            moved: []
        });

        return this;
    }

    turnBrickInto(brickId: string, newTag: string, data: any = {}) {
        const previousTag = this.query().tagByBrickId(brickId);

        const newPlan = this.plan.map((brick) => {
            if (brick.id !== brickId) {
                return brick;
            }

            return {
                ...brick,
                tag: newTag,
                data
            };
        });

        this.plans.push(newPlan);
        this.changes.push({
            turned: [
                {
                    brickId,
                    newTag,
                    previousTag
                }
            ],
            updated: [],
            added: [],
            removed: [],
            moved: [],
            planSetTo: [],
        });

        return this;
    }

    clear() {
        const removedBrickSnapshots: ITransactionRemovedChange[] = this.query().brickSnapshots().map((removedBrickSnapshot) => {
            return {
                brickSnapshot: removedBrickSnapshot,
                nearestBrickId: null
            };
        });

        this.plans.push([]);
        this.changes.push({
            removed: removedBrickSnapshots,
            added: [],
            updated: [],
            turned: [],
            moved: [],
            planSetTo: [],
        });

        return this;
    }

    // ADDITIONAL SUGAR API
    addMetadata(metadataItem: ITransactionMetadataItem) {
        this.metadata.set(metadataItem.key, metadataItem.value);
    }

    private createNewBrick(tag: string, data: any): IBrickDefinition {
        return {
            id: new Guid().get(),
            tag,
            data,
            meta: {}
        };
    }
}

class PlanQuery {
    constructor(readonly plan: IWallDefinition2, private brickRegistry: BrickRegistry) {
    }

    brickIdBasedOnPosition(position) {
        return this.plan[position].id;
    }

    brickPosition(brickId: string) {
        return this.plan.findIndex((brick) => {
            return brick.id === brickId;
        });
    }

    brickSnapshot(brickId: string): IBrickSnapshot | undefined {
        const requestedBrick = this.plan.filter((brick) => brick.id === brickId)[0];

        if (!requestedBrick) {
            return undefined;
        }

        // convert data key to state
        // super stupid but what can I do now
        const {data, ...brickData} = requestedBrick;

        return {
            ...brickData,
            state: data
        };
    }

    brickIds() {
        return this.plan.map((brick) => brick.id);
    }

    brickSnapshots() {
        return this.plan.map((brick) => this.brickSnapshot(brick.id));
    }

    length() {
        return this.plan.length;
    }

    tagByBrickId(brickId: string) {
        const requestedBrick = this.plan.filter((brick) => brick.id === brickId)[0];

        return requestedBrick.tag;
    }

    sortBrickIdsByLayoutOrder(brickIds: string[]) {
        return brickIds.map((brickId) => {
            return {
                brickId,
                position: this.brickPosition(brickId)
            };
        }).sort((a, b) => {
            return a.position > b.position ? 1 : -1;
        }).map((brickIdWithPosition) => {
            return brickIdWithPosition.brickId;
        });
    }

    isBrickAheadOf(firstBrickId: string, secondBrickId: string) {
        return this.brickPosition(firstBrickId) < this.brickPosition(secondBrickId);
    }

    getNextBrickId(brickId: string) {
        const brickPosition = this.brickPosition(brickId);
        const nextBrick = this.plan[brickPosition + 1];

        return nextBrick && nextBrick.id;
    }

    getPreviousBrickId(brickId: string) {
        const brickPosition = this.brickPosition(brickId);
        const previousBrick = this.plan[brickPosition - 1];

        return previousBrick && previousBrick.id;
    }

    getNextTextBrickId(brickId: string): string {
        const nextBricks = this.plan.slice(this.brickPosition(brickId) + 1);

        const nextTextBrick = nextBricks.find((nextBrick) => {
            return this.brickRegistry.get(nextBrick.tag).supportText;
        });

        return nextTextBrick && nextTextBrick.id;
    }

    getPreviousTextBrickId(brickId: string) {
        const previousBricks = this.plan.slice(0, this.brickPosition(brickId));

        const previousTextBrick = previousBricks.reverse().find((previousBrick) => {
            return this.brickRegistry.get(previousBrick.tag).supportText;
        });

        return previousTextBrick && previousTextBrick.id;
    }

    filterBricks(predictor: (brickSnapshot: IBrickSnapshot) => boolean): IBrickSnapshot[] {
        return this.brickSnapshots().filter((brickSnapshot) => {
            return predictor(brickSnapshot);
        });
    }

    lastBrick() {
        return this.plan[this.plan.length - 1];
    }

    hasBrick(brickId: string) {
        return Boolean(this.plan.filter((brick) => brick.id === brickId)[0]);
    }
}

class DestructorTransactionHook implements ITransactionHook {
    constructor(private brickRegistry: BrickRegistry) {
    }

    apply(transaction: Transaction) {
        transaction.change.removed.forEach((removedChange) => {
            const brickSpecification = this.brickRegistry.get(removedChange.brickSnapshot.tag);

            // ignore promise, model does not care about any side effects
            // any async operations should be handled by async services and model clients
            if (brickSpecification.destructor) {
                brickSpecification.destructor(removedChange.brickSnapshot);
            }
        });
    }
}

// high level methods
export class WallCoreApi2 {
    private isReadOnlyInternal$ = new BehaviorSubject(false);

    isReadOnly$ = this.isReadOnlyInternal$.pipe(
        shareReplay(1)
    );

    plan$: Observable<IWallDefinition2>;
    events$: Observable<TransactionEvent>;

    get isReadOnly(): boolean {
        return this.isReadOnlyInternal$.getValue();
    }

    private planStorage: PlanStorage;

    constructor(private brickRegistry: BrickRegistry) {
        this.planStorage = new PlanStorage(this.brickRegistry, {
            transactionHooks: [
                new DestructorTransactionHook(this.brickRegistry)
            ]
        });

        this.plan$ = this.planStorage.plan$;
        this.events$ = this.planStorage.events$;
    }

    query() {
        return this.planStorage.query();
    }

    // OLD PUBLIC API

    setPlan(plan: IWallDefinition2) {
        this.planStorage.transaction().setPlan(plan).apply();
    }

    addBrickAtStart(tag: string, state?: any): IBrickSnapshot {
        const tr = this.planStorage.transaction();
        const newBrickId = tr.addBrick(tag, 0, state);
        tr.apply();

        return this.getBrickSnapshot(newBrickId);
    }

    addBrickAfterBrickId(brickId: string, tag: string, data?: any) {
        const tr = this.planStorage.transaction();
        const newBrickId = tr.addBrickAfter(brickId, tag, data);

        tr.apply();

        return this.getBrickSnapshot(newBrickId);
    }

    addBrickBeforeBrickId(brickId: string, tag: string, data?: any) {
        const tr = this.planStorage.transaction();
        const newBrickId = tr.addBrickBefore(brickId, tag, data);

        tr.apply();

        return this.getBrickSnapshot(newBrickId);
    }

    addDefaultBrick() {
        const tr = this.planStorage.transaction();
        const newBrickId = tr.addBrick(DEFAULT_BRICK, this.query().length());

        tr.apply();

        return this.getBrickSnapshot(newBrickId);
    }

    updateBrickState(brickId: string, data: any) {
        this.planStorage.transaction().updateBrick(brickId, data).apply();
    }

    removeBrick(brickId: string, transactionMetadataItem?: ITransactionMetadataItem) {
        const tr = this.planStorage.transaction();
        tr.removeBrick(brickId);

        if (transactionMetadataItem) {
            tr.metadata.set(transactionMetadataItem.key, transactionMetadataItem.value);
        }

        tr.apply();
    }

    removeBricks(brickIds: string[], transactionMetadataItem?: ITransactionMetadataItem) {
        const tr = this.planStorage.transaction();

        brickIds.forEach((brickId) => {
            tr.removeBrick(brickId);
        });

        if (transactionMetadataItem) {
            tr.metadata.set(transactionMetadataItem.key, transactionMetadataItem.value);
        }

        tr.apply();
    }

    turnBrickInto(brickId: string, newTag: string, data: any = {}) {
        this.planStorage.transaction().turnBrickInto(brickId, newTag, data).apply();
    }

    moveBrickAfterBrickId(brickIdsToMove: string[], afterBrickId: string, transactionMetadataItem?: ITransactionMetadataItem) {
        const tr = this.planStorage.transaction();
        tr.moveBrickAfter(brickIdsToMove, afterBrickId);

        if (transactionMetadataItem) {
            tr.addMetadata(transactionMetadataItem);
        }

        tr.apply();
    }

    moveBrickBeforeBrickId(brickIdsToMove: string[], afterBrickId: string, transactionMetadataItem?: ITransactionMetadataItem) {
        const tr = this.planStorage.transaction();
        tr.moveBrickBefore(brickIdsToMove, afterBrickId);

        if (transactionMetadataItem) {
            tr.addMetadata(transactionMetadataItem);
        }

        tr.apply();
    }

    moveBricksAbove(brickIds: string[], transactionMetadataItem?: ITransactionMetadataItem) {
        const sortedBrickIds = this.planStorage.query().sortBrickIdsByLayoutOrder(brickIds);
        const previousBrickId = this.planStorage.query().getPreviousBrickId(sortedBrickIds[0]);

        if (!previousBrickId) {
            return;
        }

        return this.moveBrickBeforeBrickId(brickIds, previousBrickId, transactionMetadataItem);
    }

    moveBricksBelow(brickIds: string[], transactionMetadataItem?: ITransactionMetadataItem) {
        const sortedBrickIds = this.planStorage.query().sortBrickIdsByLayoutOrder(brickIds);
        const nextBrickId = this.planStorage.query().getNextBrickId(sortedBrickIds[sortedBrickIds.length - 1]);

        if (!nextBrickId) {
            return;
        }

        return this.moveBrickAfterBrickId(brickIds, nextBrickId, transactionMetadataItem);
    }

    clear() {
        this.planStorage.transaction().clear().apply();
    }

    getBrickSnapshot(brickId: string) {
        return this.planStorage.query().brickSnapshot(brickId);
    }

    getPlan() {
        return this.planStorage.query().plan;
    }

    getBrickIds() {
        return this.planStorage.query().brickIds();
    }

    isBrickAheadOf(firstBrickId: string, secondBrickId: string) {
        return this.planStorage.query().isBrickAheadOf(firstBrickId, secondBrickId);
    }

    getBricksCount() {
        return this.query().length();
    }

    getBrickTag(brickId: string) {
        return this.query().tagByBrickId(brickId);
    }

    getNextBrickId(brickId: string) {
        return this.query().getNextBrickId(brickId);
    }

    getPreviousBrickId(brickId: string) {
        return this.query().getPreviousBrickId(brickId);
    }

    getNextTextBrickId(brickId: string) {
        return this.query().getNextTextBrickId(brickId);
    }

    getPreviousTextBrickId(brickId: string) {
        return this.query().getPreviousTextBrickId(brickId);
    }

    filterBricks(predictor: (brickSnapshot: IBrickSnapshot) => boolean): IBrickSnapshot[] {
        return this.query().filterBricks(predictor);
    }

    isRegisteredBrick(tag: string) {
        return Boolean(this.brickRegistry.get(tag));
    }

    getBrickTextRepresentation(brickId: string) {
        const brickSnapshot = this.query().brickSnapshot(brickId);

        const brickSpecification = this.brickRegistry.get(brickSnapshot.tag);

        if (brickSpecification.textRepresentation) {
            const brickTextRepresentation = new brickSpecification.textRepresentation(brickSnapshot);

            return brickTextRepresentation.getText() || '';
        } else {
            return '';
        }
    }

    sortBrickIdsByLayoutOrder(brickIds: string[]) {
        return this.query().sortBrickIdsByLayoutOrder(brickIds);
    }

    enableReadOnly() {
        this.isReadOnlyInternal$.next(true);
    }

    disableReadOnly() {
        this.isReadOnlyInternal$.next(false);
    }

    getBrickResourcePaths(brickId) {
        const brickSnapshot = this.query().brickSnapshot(brickId);

        const brickSpecification = this.brickRegistry.get(brickSnapshot.tag);

        if (!brickSpecification.getBrickResourcePaths) {
            return [];
        }

        return brickSpecification.getBrickResourcePaths(brickSnapshot);
    }
}

export class WallCorePlugin2 {
    name = 'core2';
    version = '0.0.0';

    private wallModel: IWallModel;

    constructor(private brickRegistry: BrickRegistry) {
    }

    onWallInitialize(wallModel: IWallModel) {
        this.wallModel = wallModel;

        const api = new WallCoreApi2(
            this.brickRegistry
        );

        this.wallModel.registerApi(this.name, api);
    }
}
