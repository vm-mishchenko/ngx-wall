import {Subscription} from 'rxjs';
import {IWallDefinition} from '../wall.interfaces';
import {WallBrick} from './wall-brick.model';
import {IBrickSnapshot} from './wall.events';

// https://github.com/s-panferov/awesome-typescript-loader/issues/411
export const awesomeTypescriptLoaderBug3 = true;

export interface IWallRow {
    id: string;
    columns: IWallColumn[];
}

export interface IWallColumn {
    bricks: WallBrick[];
}

export interface IWallCorePluginApi {
// COMMAND METHODS
    setPlan(plan: IWallDefinition);

    addBrickAfterBrickId(brickId: string, tag: string): IBrickSnapshot;

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

    filterBricks(predictor: (wallBrick: WallBrick) => boolean): IBrickSnapshot[];

    sortBrickIdsByLayoutOrder(brickIds: string[]): string[];

    getBrickIds(): string[];

    getBrickTag(brickId: string): string;

    getBrickSnapshot(brickId: string): IBrickSnapshot;

    getBrickTextRepresentation(brickId: string): string;
}

export interface IWallModel extends IWallCorePluginApi {
    api: {
        [apiName: string]: any;
        core: IWallCorePluginApi
    };
}
