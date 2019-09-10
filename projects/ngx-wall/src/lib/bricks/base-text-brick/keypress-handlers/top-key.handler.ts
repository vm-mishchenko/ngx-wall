import {IFocusContext} from '../../../wall/wall';
import {BaseTextBrickComponent} from '../base-text-brick.component';
import {FOCUS_INITIATOR} from '../base-text-brick.constant';

export class TopKeyHandler {
    constructor(private baseTextBrickComponent: BaseTextBrickComponent) {
    }

    execute(e: KeyboardEvent) {
        const caretLeftCoordinate = this.baseTextBrickComponent.getCaretLeftCoordinate();

        if (this.baseTextBrickComponent.isCaretAtFirstLine()) {
            e.preventDefault();

            const focusContext: IFocusContext = {
                initiator: FOCUS_INITIATOR,
                details: {
                    topKey: true,
                    caretLeftCoordinate
                }
            };

            this.baseTextBrickComponent.wallUiApi
                .mode.edit.focusOnPreviousTextBrick(this.baseTextBrickComponent.id, focusContext);
        }
    }
}
