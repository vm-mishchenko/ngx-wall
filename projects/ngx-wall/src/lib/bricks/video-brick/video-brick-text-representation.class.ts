import {IBrickSnapshot} from '../../wall/wall';
import {IVideoBrickState} from './video-brick-state.interface';

export class VideoBrickTextRepresentationClass {
    constructor(private brickSnapshot: IBrickSnapshot) {
    }

    getText() {
        return `video!${(this.brickSnapshot.state as IVideoBrickState).src}`;
    }
}
