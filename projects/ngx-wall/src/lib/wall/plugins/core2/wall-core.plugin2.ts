import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Guid} from '../../../modules/utils/guid';
import {IBrickSnapshot} from '../../model/interfaces/brick-snapshot.interface';
import {IWallDefinition2} from '../../model/interfaces/wall-definition.interface2';
import {IWallModel} from '../../model/interfaces/wall-model.interface';
import {BrickRegistry} from '../../registry/brick-registry.service';
import {IBrickDefinition} from '../../wall';
import {TransactionEvent} from './events';

const DEFAULT_BRICK = 'text';

// store data and method to modify it
class Plan {
    constructor(private bricks: any[] = []) {
    }

    add(id: string): Plan {
        // immutable
        return new Plan([]);
    }

    remove(): Plan {
        // immutable
        return new Plan([]);
    }
}

interface IPlaneStorageOptions {
    transactionHooks: ITransactionHook[];
}

class PlanStorage {
    // todo: share the obsevable
    events$: Observable<any> = new Subject();

    private planBehaviour$: BehaviorSubject<IWallDefinition2> = new BehaviorSubject([]);

    plan$: Observable<IWallDefinition2> = this.planBehaviour$.asObservable();

    constructor(private options?: IPlaneStorageOptions) {
    }

    query() {
        return new PlanQuery(this.plan());
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

        (this.events$ as Subject<any>).next(new TransactionEvent(transaction.change));
    }

    private plan() {
        return this.planBehaviour$.getValue();
    }
}

// todo: implement separate class for that interfaces
export interface ITransactionChanges {
    // newly added brick ids
    added: string[];

    // moved brick ids
    moved: string[];

    // removed brick ids
    removed: IBrickSnapshot[];

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

class Transaction {
    private changes: ITransactionChanges[] = [];
    // todo: implement separate class for plan
    private plans: IWallDefinition2[] = [];

    constructor(private planStorage: PlanStorage) {
    }

    get change(): ITransactionChanges {
        const initialChange: ITransactionChanges = {
            updated: [],
            moved: [],
            removed: [],
            added: [],
            turned: [],
        };

        return this.changes.reduce((result, change) => {
            result = {
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
        return this;
    }

    apply() {
        this.planStorage.applyTransaction(this);
    }

    query() {
        return new PlanQuery(this.plan);
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

        const targetBrickIdPosition = new PlanQuery(newPlan).brickPosition(targetBrickId);
        const beforeTargetBrickIdPosition = targetBrickIdPosition;

        newPlan = [
            ...newPlan.slice(0, beforeTargetBrickIdPosition),
            ...orderedBricksToMove,
            ...newPlan.slice(beforeTargetBrickIdPosition)
        ];

        this.plans.push(newPlan);
        this.changes.push({
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

        const targetBrickIdPosition = new PlanQuery(newPlan).brickPosition(targetBrickId);
        const afterTargetBrickIdPosition = targetBrickIdPosition + 1;

        newPlan = [
            ...newPlan.slice(0, afterTargetBrickIdPosition),
            ...orderedBricksToMove,
            ...newPlan.slice(afterTargetBrickIdPosition)
        ];

        this.plans.push(newPlan);
        this.changes.push({
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
        const brickSnapshot = this.query().brickSnapshot(brickId);

        const newPlan = this.plan.filter((brick) => {
            if (brick.id !== brickId) {
                return brick;
            }
        });

        this.plans.push(newPlan);
        this.changes.push({
            removed: [brickSnapshot],
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
            moved: []
        });

        return this;
    }

    clear() {
        const removedBrickSnapshots = this.query().brickSnapshots();

        this.plans.push([]);
        this.changes.push({
            removed: removedBrickSnapshots,
            added: [],
            updated: [],
            turned: [],
            moved: []
        });

        return this;
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
    constructor(readonly plan: IWallDefinition2) {
    }

    brickIdBasedOnPosition(position) {
        return this.plan[position].id;
    }

    brickPosition(brickId: string) {
        return this.plan.findIndex((brick) => {
            return brick.id === brickId;
        });
    }

    brickSnapshot(brickId: string): IBrickSnapshot {
        const requestedBrick = this.plan.filter((brick) => brick.id === brickId)[0];

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

    getNextTextBrickId(brickId: string) {
        const nextBricks = this.plan.slice(this.brickPosition(brickId) + 1);

        const nextTextBrick = nextBricks.find((nextBrick) => {
            return nextBrick.tag === DEFAULT_BRICK;
        });

        return nextTextBrick && nextTextBrick.id;
    }

    getPreviousTextBrickId(brickId: string) {
        const previousBricks = this.plan.slice(0, this.brickPosition(brickId));

        const previousTextBrick = previousBricks.reverse().find((previousBrick) => {
            return previousBrick.tag === DEFAULT_BRICK;
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
}

class DestructorTransactionHook implements ITransactionHook {
    constructor(private brickRegistry: BrickRegistry) {
    }

    apply(transaction: Transaction) {
        transaction.change.removed.forEach((removedBrickSnapshot) => {
            const brickSpecification = this.brickRegistry.get(removedBrickSnapshot.tag);

            // ignore promise, model does not care about any side effects
            // any async operations should be handled by async services and model clients
            if (brickSpecification.destructor) {
                brickSpecification.destructor(removedBrickSnapshot);
            }
        });
    }
}

// high level methods
export class WallCoreApi2 {
    // todo: implement
    isReadOnly$: Observable<boolean> = new BehaviorSubject(false);
    plan$: Observable<IWallDefinition2>;
    events$: Observable<TransactionEvent>;

    get isReadOnly() {
        return (this.isReadOnly$ as BehaviorSubject<boolean>).getValue();
    }

    private planStorage: PlanStorage;

    constructor(private brickRegistry: BrickRegistry) {
        this.planStorage = new PlanStorage({
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

    removeBrick(brickId: string) {
        this.planStorage.transaction().removeBrick(brickId).apply();
    }

    removeBricks(brickIds: string[]) {
        const tr = this.planStorage.transaction();

        brickIds.forEach((brickId) => {
            tr.removeBrick(brickId);
        });

        tr.apply();
    }

    turnBrickInto(brickId: string, newTag: string, data: any = {}) {
        this.planStorage.transaction().turnBrickInto(brickId, newTag, data).apply();
    }

    moveBrickAfterBrickId(brickIdsToMove: string[], afterBrickId: string) {
        this.planStorage.transaction().moveBrickAfter(brickIdsToMove, afterBrickId).apply();
    }

    moveBrickBeforeBrickId(brickIdsToMove: string[], afterBrickId: string) {
        const beforeBrickPosition = this.query().brickPosition(afterBrickId);

        this.planStorage.transaction()
            .moveBrickBefore(brickIdsToMove, afterBrickId).apply();
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
