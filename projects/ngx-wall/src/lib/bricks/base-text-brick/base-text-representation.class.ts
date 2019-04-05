import {IBrickSnapshot} from '../../wall/wall';
import {IBaseTextState} from './base-text-state.interface';

export class TextRepresentation {
    constructor(private brickSnapshot: IBrickSnapshot) {
    }

    getText() {
        return (this.brickSnapshot.state as IBaseTextState).text;
    }
}
