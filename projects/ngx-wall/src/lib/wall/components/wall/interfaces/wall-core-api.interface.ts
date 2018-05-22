import {Subscription} from 'rxjs';
import {IBrickSnapshot} from '../../../model/wall.events';
import {IWallDefinition} from '../../../wall.interfaces';
import {IFocusContext} from '../wall.interfaces';
import {IWallState} from './wall-state.interface';

export interface IWallCoreApi {
    state: IWallState;

    // SELECTION API
    getSelectedBrickIds(): string[];

    selectBrick(brickId: string): void;

    selectBricks(brickIds: string[]): void;

    addBrickToSelection(brickId: string): void;

    removeBrickFromSelection(brickId: string): void;

    unSelectBricks(): void;

    // FOCUS
    focusOnBrickId(brickId: string, focusContext?: IFocusContext): void;

    getFocusedBrickId(): string;

    focusOnPreviousTextBrick(brickId: string, focusContext?: IFocusContext);

    focusOnNextTextBrick(brickId: string, focusContext?: IFocusContext);

    // ADD BRICK
    addBrickAfterBrickId(brickId: string, tag: string, state?: any): void;

    // MOVE BRICK
    moveBrickAfterBrickId(targetBrickIds: string[], beforeBrickId: string);

    moveBrickBeforeBrickId(targetBrickIds: string[], beforeBrickId: string);

    moveBrickToNewColumn(targetBrickIds: string[], beforeBrickId: string, side: string);

    // REMOVE BRICK
    removeBrick(brickId: string);

    removeBricks(brickIds): void;

    // NAVIGATION
    getPreviousBrickId(brickId: string): string;

    getNextBrickId(brickId: string): string;

    getPreviousTextBrickId(brickId: string): string;

    getNextTextBrickId(brickId: string): string;

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean;

    // BEHAVIOUR
    enableMediaInteraction();

    disableMediaInteraction();

    // CLIENT
    getPlan(): IWallDefinition;

    setPlan(plan: IWallDefinition): void;

    subscribe(callback: (e: any) => any): Subscription;

    // BRICK
    isRegisteredBrick(tag: string): boolean;

    turnBrickInto(brickId: string, newTag: string, state?: any): void;

    filterBricks(predictor: () => {}): IBrickSnapshot[];

    updateBrickState(brickId: string, state: any): void;

    getBrickSnapshot(brickId: string): IBrickSnapshot;

    getBrickTextRepresentation(brickId: string): string;
}
