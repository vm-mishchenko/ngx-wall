import { Subscription } from 'rxjs/Subscription';
import { IWallDefinition } from '../wall.interfaces';
import { WallBrick } from './wall-brick.model';
import { IBrickSnapshot } from './wall.events';

export interface IWallRow {
    id: string;
    columns: IWallColumn[];
}

export interface IWallColumn {
    bricks: WallBrick[];
}

export interface IWallModel {
    getNextBrickId(brickId: string): string;

    getNextTextBrickId(brickId: string): string;

    getPreviousTextBrickId(brickId: string): string;

    getPreviousBrickId(brickId: string): string;

    setPlan(plan: IWallDefinition);

    getPlan(): IWallDefinition;

    getRowCount(): number;

    getColumnCount(rowIndex: number): number;

    updateBrickState(brickId, brickState): void;

    turnBrickInto(brickId: string, newTag: string);

    addDefaultBrick(): void;

    addBrickAfterBrickId(brickId: string, tag: string): IBrickSnapshot;

    moveBrickAfterBrickId(targetBrickIds: string[], beforeBrickId: string): void;

    moveBrickBeforeBrickId(targetBrickIds: string[], beforeBrickId: string): void;

    moveBrickToNewColumn(targetBrickIds: string[], beforeBrickId: string, side: string): void;

    removeBrick(brickId: string): void;

    removeBricks(brickIds): void;

    getBricksCount(): number;

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean;

    subscribe(fn: (event) => any): Subscription;

    traverse(fn: (row: any) => any): void; // todo - traverse quite strange method?

    filterBricks(predictor: () => any): IBrickSnapshot[];

    getBrickIds(): string[];

    getBrickTag(brickId: string): string;

    getBrickSnapshot(brickId: string): IBrickSnapshot;

    getBrickTextRepresentation(brickId: string): string;
}
