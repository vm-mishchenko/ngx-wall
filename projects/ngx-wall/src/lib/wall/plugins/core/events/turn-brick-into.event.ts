export class TurnBrickIntoEvent {
    constructor(public brickId: string,
                public newTag: string,
                public oldTag: string) {
    }
}
