import {IFocusContext} from '../../../wall/wall';
import {BaseTextBrickComponent} from '../base-text-brick.component';
import {FOCUS_INITIATOR} from '../base-text-brick.constant';

export class BottomKeyHandler {
    constructor(private baseTextBrickComponent: BaseTextBrickComponent) {
    }

    execute(e: KeyboardEvent) {
        console.log(`bottom`);
        if (this.baseTextBrickComponent.isCaretAtLastLine()) {
            e.preventDefault();

            const caretLeftCoordinate = this.baseTextBrickComponent.getCaretLeftCoordinate();

            const focusContext: IFocusContext = {
                initiator: FOCUS_INITIATOR,
                details: {
                    bottomKey: true,
                    caretLeftCoordinate
                }
            };

            this.baseTextBrickComponent.wallUiApi.mode.edit.focusOnNextTextBrick(this.baseTextBrickComponent.id, focusContext);
        }
    }
}
