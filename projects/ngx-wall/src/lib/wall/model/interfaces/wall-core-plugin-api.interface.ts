import {Observable, Subscription} from 'rxjs';
import {IBrickSnapshot} from './brick-snapshot.interface';
import {IWallDefinition2} from './wall-definition.interface2';

export interface IWallCorePluginApi {
    // STATE
    isReadOnly$: Observable<boolean>;

    isReadOnly: boolean;

    // COMMAND METHODS
    setPlan(plan: IWallDefinition2);

    addBrickAfterBrickId(brickId: string, tag: string, state?: object): IBrickSnapshot;

    addBrickBeforeBrickId(brickId: string, tag: string, state?: object): IBrickSnapshot;

    getBrickResourcePaths(brickId: string): string[];

    enableReadOnly();

    disableReadOnly();

    // QUERY METHODS

    getNextBrickId(brickId: string): string;

    getNextTextBrickId(brickId: string): string;

    getPreviousTextBrickId(brickId: string): string;

    getPreviousBrickId(brickId: string): string;

    getPlan(): IWallDefinition2;

    updateBrickState(brickId, brickState): void;

    turnBrickInto(brickId: string, newTag: string, state?: any);

    addBrickAtStart(tag: string, state?: any): IBrickSnapshot;

    addDefaultBrick(): void;

    moveBrickAfterBrickId(targetBrickIds: string[], beforeBrickId: string): void;

    moveBrickBeforeBrickId(targetBrickIds: string[], beforeBrickId: string): void;

    removeBrick(brickId: string): void;

    removeBricks(brickIds): void;

    clear(): void;

    getBricksCount(): number;

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean;

    filterBricks(predictor: (wallBrick: IBrickSnapshot) => boolean): IBrickSnapshot[];

    sortBrickIdsByLayoutOrder(brickIds: string[]): string[];

    getBrickIds(): string[];

    getBrickTag(brickId: string): string;

    getBrickSnapshot(brickId: string): IBrickSnapshot;

    getBrickTextRepresentation(brickId: string): string;

    isRegisteredBrick(tag: string): boolean;
}
