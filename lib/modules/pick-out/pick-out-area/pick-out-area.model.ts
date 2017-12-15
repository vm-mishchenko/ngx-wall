export class PickOutAreaModel {
    initialX: number;
    initialY: number;
    initialBrickId: string;

    x: number;
    y: number;
    width: number;
    height: number;
    currentBrickId: string;

    private minimumMoveDistance = 5;

    constructor(x: number,
                y: number,
                overBrickId: string) {
        this.initialX = x;
        this.initialY = y;

        this.x = x;
        this.y = y;

        this.initialBrickId = overBrickId;
        this.currentBrickId = overBrickId;
    }

    updateCurrentPosition(x: number, y: number) {
        // update x position and width
        if (x < this.initialX) {
            this.width = this.initialX - x;

            this.x = x;
        } else {
            this.width = Math.abs(x - this.x);
        }

        // update y position and height
        if (y < this.initialY) {
            this.height = this.initialY - y;

            this.y = y;
        } else {
            this.height = Math.abs(y - this.y);
        }
    }

    updateCurrentBrickId(brickId: string): void {
        this.currentBrickId = brickId;
    }

    canInitiatePickOutProcess(): boolean {
        return this.isMouseMovedEnough() &&
            (!this.currentBrickId || this.currentBrickId !== this.initialBrickId);
    }

    private isMouseMovedEnough(): boolean {
        return this.width > this.minimumMoveDistance ||
            this.height > this.minimumMoveDistance;
    }
}
