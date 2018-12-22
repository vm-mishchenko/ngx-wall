import {BaseTextBrickComponent} from '../base-text-brick.component';

export class EnterKeyHandler {
    constructor(private baseTextBrickComponent: BaseTextBrickComponent) {
    }

    execute(e: KeyboardEvent) {
        e.preventDefault();

        const sel = window.getSelection();

        const splittedText = this.baseTextBrickComponent.getSplittedText(
            sel.focusOffset,
            sel.focusNode
        );

        splittedText.left = this.baseTextBrickComponent.cleanUpText(splittedText.left);
        splittedText.right = this.baseTextBrickComponent.cleanUpText(splittedText.right);

        if (splittedText.left.length) {
            if (splittedText.right.length) {
                // text is splitted to two part
                this.splitBrickForTwoPart(splittedText.left, splittedText.right);
            } else {
                // cursor at end - text's exist - create new and focus on it
                this.addEmptyBrickAfter();
            }
        } else {
            if (splittedText.right.length) {
                // cursor at start, text exists - just create new line at top, do not move focus
                this.addEmptyTextBrickBefore();
            } else {
                // there are no text at all - create new and focus on it
                this.addEmptyBrickAfter();
            }
        }
    }

    private splitBrickForTwoPart(left: string, right: string) {
        this.addBrickAfter(right);

        this.baseTextBrickComponent.setTextState(left);
        this.baseTextBrickComponent.saveCurrentState();
    }

    private addEmptyTextBrickBefore() {
        const newTextState = {
            text: '',
            tabs: this.baseTextBrickComponent.scope.tabs
        };

        this.baseTextBrickComponent.wallModel.api.core
            .addBrickBeforeBrickId(this.baseTextBrickComponent.id, 'text', newTextState);

        // scroll browser view to element
        this.baseTextBrickComponent.editor.nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'start'
        });
    }

    private addEmptyBrickAfter() {
        // cursor at end - text's exist - create new and focus on it
        this.addBrickAfter('');
    }

    private addBrickAfter(text: string) {
        const newTextState = {
            text: text,
            tabs: this.baseTextBrickComponent.scope.tabs
        };

        const addedBrick = this.baseTextBrickComponent.wallModel.api.core
            .addBrickAfterBrickId(this.baseTextBrickComponent.id, 'text', newTextState);

        // wait one tick for component rendering
        setTimeout(() => {
            this.baseTextBrickComponent.wallUiApi.focusOnBrickId(addedBrick.id);
        });
    }
}
