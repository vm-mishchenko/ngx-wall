import {IBrickSnapshot} from '../../wall/wall';
import {IBaseTextState} from './base-text-state.interface';

const REG_EXP_SPACE = new RegExp(/&nbsp;/, 'g');

export class TextRepresentation {
    constructor(private brickSnapshot: IBrickSnapshot) {
    }

    getText() {
        const text = (this.brickSnapshot.state as IBaseTextState).text || '';

        return text.replace(REG_EXP_SPACE, '');
    }
}
