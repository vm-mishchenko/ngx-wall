import { IBrickSnapshot } from '../wall';
import { ImgBrickState } from './img-brick-state.interface';

export class ImgBrickTextRepresentation {
    constructor(private brickSnapshot: IBrickSnapshot) {
    }

    getText() {
        return `video!${(this.brickSnapshot.state as ImgBrickState).src}`;
    }
}
