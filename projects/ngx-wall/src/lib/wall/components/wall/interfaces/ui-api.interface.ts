import {Subscription} from 'rxjs';
import {Observable} from 'rxjs/internal/Observable';
import {IFocusContext} from './wall-component/wall-component-focus-context.interface';

export interface IWallUiApi {
    isEditMode$: Observable<boolean>;

    selectBrick(brickId: string): void;

    selectBricks(brickIds: string[]): void;

    addBrickToSelection(brickId: string): void;

    removeBrickFromSelection(brickId: string): void;

    unSelectBricks(): void;

    focusOnBrickId(brickId: string, focusContext?: IFocusContext);

    getFocusedBrickId(): string;

    focusOnPreviousTextBrick(brickId: string, focusContext?: IFocusContext);

    focusOnNextTextBrick(brickId: string, focusContext?: IFocusContext);

    removeBrick(brickId: string): void;

    removeBricks(brickIds: string[]): void;

    getSelectedBrickIds(): string[];

    enableMediaInteraction(): void;

    disableMediaInteraction(): void;

    switchToReadMode(): void;

    switchToEditMode(): void;

    subscribe(callback: any): Subscription;
}
