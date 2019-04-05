import {IBrickSnapshot} from '../../wall/wall';
import {ImgBrickState} from './img-brick-state.interface';

export class ImgBrickTextRepresentation {
    constructor(private brickSnapshot: IBrickSnapshot) {
    }

    getText() {
        return `img!${(this.brickSnapshot.state as ImgBrickState).src}`;
    }
}
