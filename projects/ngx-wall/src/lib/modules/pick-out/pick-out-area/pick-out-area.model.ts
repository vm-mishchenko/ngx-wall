export class PickOutAreaModel {
    // brick ids allow to define should we render area component
    initialBrickId: string;
    currentBrickId: string;

    // calculate pick out area width and height
    initialX: number;
    initialY: number;

    // store last client X and Y position before scroll event
    previousClientX: number;
    previousClientY: number;

    // coordinates inside scrollable container
    x: number;
    y: number;

    // coordinates related to viewport
    clientX: number;
    clientY: number;

    // size of pick out area
    width: number;
    height: number;

    isPickOutProcessInitialized = false;

    scrollableContainer: HTMLElement;

    private minimumMoveDistance = 5;

    constructor(scrollableContainer: HTMLElement,
                x: number,
                y: number,
                overBrickId: string) {
        this.scrollableContainer = scrollableContainer;

        this.initialX = x;
        this.initialY = y;

        this.x = x;
        this.y = y;

        this.initialBrickId = overBrickId;
        this.currentBrickId = overBrickId;
    }

    recalculatePositionAndSize() {
        const scrollContextRect = this.scrollableContainer.getBoundingClientRect();

        const pageX = this.previousClientX - scrollContextRect.left;
        const pageY = this.previousClientY - scrollContextRect.top + this.scrollableContainer.scrollTop;

        this.updatePickOutAreaPositionAndSize(pageX, pageY);
    }

    updateCurrentClientPosition(clientX: number, clientY: number) {
        this.previousClientX = clientX;
        this.previousClientY = clientY;

        this.recalculatePositionAndSize();
    }

    updateCurrentBrickId(brickId: string): void {
        this.currentBrickId = brickId;
    }

    canInitiatePickOutProcess(): boolean {
        return this.isMouseMovedEnough() &&
            (!this.currentBrickId || this.currentBrickId !== this.initialBrickId);
    }

    initiatePickOutProcess() {
        this.isPickOutProcessInitialized = true;
    }

    private updatePickOutAreaPositionAndSize(x: number, y: number) {
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

        const scrollContextRect = this.scrollableContainer.getBoundingClientRect();

        this.clientX = scrollContextRect.left + this.x;
        this.clientY = scrollContextRect.top + this.y - this.scrollableContainer.scrollTop;
    }

    private isMouseMovedEnough(): boolean {
        return this.width > this.minimumMoveDistance ||
            this.height > this.minimumMoveDistance;
    }
}
