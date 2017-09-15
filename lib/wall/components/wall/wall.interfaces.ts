import { Subscription } from 'rxjs/Subscription';

// https://github.com/s-panferov/awesome-typescript-loader/issues/411
export const awesomeTypescriptLoaderBug = true;


// Serialized Wall Definition
export interface IWallDefinition {
    bricks: IBrickDefinition[];
    layout: ILayoutDefinition;
}

export interface IBrickDefinition {
    id: string;
    tag: string;

    // user specific data
    data: {};

    meta: {
        comments?: any[]
    }
}

export interface ILayoutDefinition {
    bricks: IRowLayoutDefinition[];
}

export interface IRowLayoutDefinition {
    columns: IColumnLayoutDefinition[];
}

export interface IColumnLayoutDefinition {
    bricks: { id: string }[]
}

export interface IWallCoreApi {
    getSelectedBrickIds(): string[];

    selectBrick(brickId: string): void;

    selectBricks(brickIds: string[]): void;

    unSelectBricks(): void;

    focusOnBrickId(brickId: string): void;

    addBrickToSelection(brickId: string): void;

    removeBrickFromSelection(brickId: string): void

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean

    getPlan(): IWallDefinition;

    getMode(): string;

    turnBrickInto(brickId: string, newTag: string): void;

    addDefaultBrick(): void;

    addBrick(tag: string, targetRowIndex: number, targetColumnIndex: number, positionIndex: number);

    addBrickToNewRow(tag: string, targetRowIndex: number);

    addBrickToNewColumn(tag: string, targetRowIndex: number, targetColumnIndex: number)

    addBrickAfterInSameColumn(brickId: string, tag: string)

    addBrickAfterInNewRow(brickId: string, tag: string)

    removeBrick(brickId: string)

    removeBricks(brickIds): void

    getPreviousBrickId(brickId: string): string;

    getNextBrickId(brickId: string): string;

    getBrickStore(brickId: string);

    getFocusedBrickId(): string;

    focusOnPreviousTextBrick(brickId: string);

    focusOnNextTextBrick(brickId: string);

    subscribe(callback: Function): Subscription;
}

// Wall component
export interface IWallConfiguration {
    mode?: string;
    onRegisterApi?: Function;
}

// Custom wall component interface
export interface onWallFocus {
    onWallFocus(): void;
}