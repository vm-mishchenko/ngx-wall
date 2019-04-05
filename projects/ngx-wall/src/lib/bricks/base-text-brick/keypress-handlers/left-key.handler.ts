import {IFocusContext} from '../../../wall/wall';
import {BaseTextBrickComponent} from '../base-text-brick.component';
import {FOCUS_INITIATOR} from '../base-text-brick.constant';

export class LeftKeyHandler {
    constructor(private baseTextBrickComponent: BaseTextBrickComponent) {
    }

    execute(e: KeyboardEvent) {
        e.preventDefault();

        const focusContext: IFocusContext = {
            initiator: FOCUS_INITIATOR,
            details: {
                leftKey: true
            }
        };

        this.baseTextBrickComponent.wallUiApi
            .focusOnPreviousTextBrick(this.baseTextBrickComponent.id, focusContext);
    }
}
