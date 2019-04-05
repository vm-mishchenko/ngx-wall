import {IFocusContext} from '../../../wall/wall';
import {BaseTextBrickComponent} from '../base-text-brick.component';
import {FOCUS_INITIATOR} from '../base-text-brick.constant';

export class RightKeyHandler {
    constructor(private baseTextBrickComponent: BaseTextBrickComponent) {
    }

    execute(e: KeyboardEvent) {
        e.preventDefault();

        const focusContext: IFocusContext = {
            initiator: FOCUS_INITIATOR,
            details: {
                rightKey: true
            }
        };

        this.baseTextBrickComponent.wallUiApi.focusOnNextTextBrick(this.baseTextBrickComponent.id, focusContext);
    }
}
