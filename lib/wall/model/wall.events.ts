/* tslint:disable */

export interface IBrickSnapshot {
    id: string;
    tag: string;
    state: any;
}

export class RemoveBrickEvent {
    constructor(public brick: IBrickSnapshot,
                public previousBrickId: string,
                public nextBrickId: string) {
    }
}

export class RemoveBricksEvent {
    constructor(public bricks: IBrickSnapshot[],
                public previousBrickId: string,
                public nextBrickId: string) {
    }
}

export class AddBrickEvent {
    constructor(public brickId: string) {
    }
}

export class UpdateBrickStateEvent {
    constructor(public brickId: string,
                public brickState: any,
                public oldBrickState: any) {
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

export class SetPlanEvent {
}

export class BeforeChangeEvent {
    constructor(public beforeEventType: any) {
    }
}
