export interface RemovedBrick {
    id: string;
    tag: string;
    state: any;
}

export class RemoveBrickEvent {
    constructor(public brick: RemovedBrick,
                public previousBrickId: string,
                public nextBrickId: string) {
    }
}

export class RemoveBricksEvent {
    constructor(public bricks: RemovedBrick[],
                public previousBrickId: string,
                public nextBrickId: string) {
    }
}

export class AddBrickEvent {
    constructor(public brickId: string) {
    }
}

export class UpdateBrickStateEvent {
    constructor(public brickId: string, public brickState: any) {
    }
}

export class TurnBrickIntoEvent {
    constructor(public brickId: string,
                public newTag: string,
                public oldTag: string) {
    }
}

export class MoveBrickEvent {
    constructor(public movedBrickIds: string[], beforeBrickId: string) {
    }
}