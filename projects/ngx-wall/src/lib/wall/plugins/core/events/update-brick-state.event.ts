export class UpdateBrickStateEvent {
    constructor(public brickId: string,
                public brickState: any,
                public oldBrickState: any) {
    }
}
