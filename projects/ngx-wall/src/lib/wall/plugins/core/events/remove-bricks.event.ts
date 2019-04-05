import {IBrickSnapshot} from '../../../model/interfaces/brick-snapshot.interface';

export class RemoveBricksEvent {
    constructor(public bricks: IBrickSnapshot[],
                public previousBrickId: string,
                public nextBrickId: string) {
    }
}
