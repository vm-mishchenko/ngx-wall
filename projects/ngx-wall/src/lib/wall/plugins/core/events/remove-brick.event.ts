import {IBrickSnapshot} from '../../../model/interfaces/brick-snapshot.interface';

export class RemoveBrickEvent {
    constructor(public brick: IBrickSnapshot,
                public previousBrickId: string,
                public nextBrickId: string) {
    }
}
