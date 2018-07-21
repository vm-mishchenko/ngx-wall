import {BaseTextBrickComponent} from '../base-text-brick.component';

export class EnterKeyHandler {
    constructor(private baseTextBrickComponent: BaseTextBrickComponent) {
    }

    execute(e: KeyboardEvent) {
        e.preventDefault();

        const sel = window.getSelection();

        const splittedText = this.baseTextBrickComponent.getSplittedText(sel.focusOffset, sel.focusNode);


        const newTextState = {
            text: this.baseTextBrickComponent.cleanUpText(splittedText.right),
            tabs: this.baseTextBrickComponent.scope.tabs
        };

        // update current brick
        this.baseTextBrickComponent.setTextState(splittedText.left);

        // if current text is spliced, save current states
        if (newTextState.text.length) {
            this.baseTextBrickComponent.saveCurrentState();
        }

        this.baseTextBrickComponent.wallModel.api.core
            .addBrickAfterBrickId(this.baseTextBrickComponent.id, 'text', newTextState);
    }
}
