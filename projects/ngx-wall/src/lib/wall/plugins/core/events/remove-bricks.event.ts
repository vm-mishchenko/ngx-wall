import {IBrickSnapshot} from '../../..';

export class RemoveBricksEvent {
    constructor(public bricks: IBrickSnapshot[],
                public previousBrickId: string,
                public nextBrickId: string) {
    }
}
