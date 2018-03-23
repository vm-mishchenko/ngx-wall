export class WorkInProgressEvent {
    constructor(public mousePosition: {
        xViewportPosition: number;
        yViewportPosition: number;
        xPosition: number;
        yPosition: number;
    }) {
    }
}
