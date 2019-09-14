import {IBrickSnapshot} from '../../wall/wall';
import {IBaseTextState} from './base-text-state.interface';

const REG_EXP_SPACE = new RegExp(/&nbsp;/, 'g');

export class TextRepresentation {
    constructor(private brickSnapshot: IBrickSnapshot) {
    }

    getText() {
        return (this.brickSnapshot.state as IBaseTextState).text.replace(REG_EXP_SPACE, '');
    }
}
