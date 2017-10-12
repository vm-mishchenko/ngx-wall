export class DropEvent {
    constructor(public targetId: string, public beforeId: string, public dropType: string, public dropSide: string) {
    }
}