export interface IWallViewModel {
    canvasLayout: any;

    selectBrick(brickId: string): void;

    selectBricks(brickId: string[]): void;

    addBrickToSelection(brickId: string): void;

    removeBrickFromSelection(brickId: string): void;

    unSelectBricks(): void;

    onFocusedBrick(brickId: string): void;

    getSelectedBrickIds(): void;

    getFocusedBrickId(): string;

    isRegisteredBrick(tag: string): boolean;

    focusOnBrickId(brickId: string): void;

    focusOnPreviousTextBrick(brickId: string): void;

    focusOnNextTextBrick(brickId: string): void;

    enableMediaInteraction(): void;

    disableMediaInteraction(): void;
}
