import {Subscription} from 'rxjs';
import {IWallDefinition} from './wall-definition.interface';
import {IBrickSnapshot} from './brick-snapshot.interface';

export interface IWallCorePluginApi {
    // COMMAND METHODS
    setPlan(plan: IWallDefinition);

    addBrickAfterBrickId(brickId: string, tag: string, state?: object): IBrickSnapshot;

    addBrickBeforeBrickId(brickId: string, tag: string, state?: object): IBrickSnapshot;

    getBrickResourcePaths(brickId: string): string[];

    // QUERY METHODS

    getNextBrickId(brickId: string): string;

    getNextTextBrickId(brickId: string): string;

    getPreviousTextBrickId(brickId: string): string;

    getPreviousBrickId(brickId: string): string;

    getPlan(): IWallDefinition;

    getRowCount(): number;

    getColumnCount(rowIndex: number): number;

    updateBrickState(brickId, brickState): void;

    turnBrickInto(brickId: string, newTag: string, state?: any);

    addBrickAtStart(tag: string, state?: any): IBrickSnapshot;

    addDefaultBrick(): void;

    moveBrickAfterBrickId(targetBrickIds: string[], beforeBrickId: string): void;

    moveBrickBeforeBrickId(targetBrickIds: string[], beforeBrickId: string): void;

    moveBrickToNewColumn(targetBrickIds: string[], beforeBrickId: string, side: string): void;

    removeBrick(brickId: string): void;

    removeBricks(brickIds): void;

    clear(): Promise<void>;

    getBricksCount(): number;

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean;

    subscribe(fn: (event: any) => any): Subscription;

    traverse(fn: (row: any) => any): void; // todo - traverse quite strange method?

    filterBricks(predictor: (wallBrick: IBrickSnapshot) => boolean): IBrickSnapshot[];

    sortBrickIdsByLayoutOrder(brickIds: string[]): string[];

    getBrickIds(): string[];

    getBrickTag(brickId: string): string;

    getBrickSnapshot(brickId: string): IBrickSnapshot;

    getBrickTextRepresentation(brickId: string): string;

    isRegisteredBrick(tag: string): boolean;
}
