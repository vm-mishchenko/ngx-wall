export class RemoveBrickEvent {
    constructor(public brickId: string) {
    }
}

export class RemoveBricksEvent {
    constructor(public brickIds: string[]) {
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
