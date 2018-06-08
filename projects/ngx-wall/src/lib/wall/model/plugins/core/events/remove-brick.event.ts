import {IBrickSnapshot} from '../../../interfaces/brick-snapshot.interface';

export class RemoveBrickEvent {
    constructor(public brick: IBrickSnapshot,
                public previousBrickId: string,
                public nextBrickId: string) {
    }
}
