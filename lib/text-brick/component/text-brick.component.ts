import { Component } from '@angular/core';
import { onWallFocus, WallApi } from '../../wall';
import { FocusContext } from "../../wall/components/wall";
import { BaseTextBrickComponent } from "../../base-text-brick/base-text-brick.component";

@Component({
    selector: 'text-brick',
    templateUrl: './text-brick-component.component.html',
    styles: [`
        p {
            min-height: 24px;
            margin: 0;
        }
    `]
})
export class TextBrickComponent extends BaseTextBrickComponent implements onWallFocus {
    constructor(private wallApi: WallApi) {
        super();
    }

    onChange() {
        this.saveCurrentState();
    }

    onKeyPress(e: any) {
        const ENTER_KEY = 13;
        const DELETE_KEY = 46;
        const BACK_SPACE_KEY = 8;
        const LEFT_KEY = 37;
        const TOP_KEY = 38;
        const RIGHT_KEY = 39;
        const BOTTOM_KEY = 40;

        if (e.keyCode === TOP_KEY) {
            e.preventDefault();

            const focusContext: FocusContext = {
                initiator: 'text-brick',
                details: {
                    topKey: true,
                    caretPosition: this.getCaretPosition()
                }
            };

            this.wallApi.core.focusOnPreviousTextBrick(this.id, focusContext);
        }

        if (e.keyCode === BOTTOM_KEY) {
            e.preventDefault();

            const focusContext: FocusContext = {
                initiator: 'text-brick',
                details: {
                    bottomKey: true,
                    caretPosition: this.getCaretPosition()
                }
            };

            this.wallApi.core.focusOnNextTextBrick(this.id, focusContext);
        }

        if (e.keyCode === LEFT_KEY && this.isCaretAtStart()) {
            const focusContext: FocusContext = {
                initiator: 'text-brick',
                details: {
                    leftKey: true
                }
            };

            this.wallApi.core.focusOnPreviousTextBrick(this.id, focusContext);
        }

        if (e.keyCode === RIGHT_KEY && this.isCaretAtEnd()) {
            const focusContext: FocusContext = {
                initiator: 'text-brick',
                details: {
                    rightKey: true
                }
            };

            this.wallApi.core.focusOnNextTextBrick(this.id, focusContext);
        }

        if (e.keyCode === BACK_SPACE_KEY && this.isCaretAtStart() && this.scope.text.length) {
            const previousTextBrickId = this.wallApi.core.getPreviousTextBrickId(this.id);

            if (previousTextBrickId) {
                const previousBrickSnapshot = this.wallApi.core.getBrickSnapshot(previousTextBrickId);

                const caretPosition = previousBrickSnapshot.state.text.length;

                this.wallApi.core.updateBrickState(previousTextBrickId, {
                    text: previousBrickSnapshot.state.text + (this.scope.text || '')
                });

                this.wallApi.core.removeBrick(this.id);

                const focusContext: FocusContext = {
                    initiator: 'text-brick',
                    details: {
                        concatText: true,
                        caretPosition: caretPosition
                    }
                };

                this.wallApi.core.focusOnBrickId(previousTextBrickId, focusContext);
            }
        }

        if (e.keyCode === DELETE_KEY && this.isCaretAtEnd()) {
            const nextTextBrickId = this.wallApi.core.getNextTextBrickId(this.id);

            if (nextTextBrickId) {
                const nextTextBrickSnapshot = this.wallApi.core.getBrickSnapshot(nextTextBrickId);

                const caretPosition = this.scope.text.length;

                this.scope.text += nextTextBrickSnapshot.state.text;

                this.wallApi.core.removeBrick(nextTextBrickId);

                setTimeout(() => {
                    this.placeCaretAtPosition(caretPosition);
                }, 0);

                this.saveCurrentState();
            }
        }

        if ((e.keyCode === BACK_SPACE_KEY || e.keyCode === DELETE_KEY) && this.scope.text === '') {
            e.preventDefault();

            const previousTextBrickId = this.wallApi.core.getPreviousTextBrickId(this.id);

            this.wallApi.core.removeBrick(this.id);

            if (previousTextBrickId) {
                const focusContext: FocusContext = {
                    initiator: 'text-brick',
                    details: {
                        deletePreviousText: true
                    }
                };

                this.wallApi.core.focusOnBrickId(previousTextBrickId, focusContext);
            }
        }

        if (e.keyCode === ENTER_KEY) {
            e.preventDefault();

            if (this.isTag()) {
                const newTag = this.scope.text.slice(1);

                this.wallApi.core.turnBrickInto(this.id, newTag);

                // d - divider tag
                if (newTag === 'd') {
                    this.wallApi.core.addBrickAfterBrickId(this.id, 'text');
                }
            } else {
                const sel = window.getSelection();

                const textState = {
                    text: this.scope.text.slice(sel.baseOffset)
                };

                this.wallApi.core.addBrickAfterBrickId(this.id, 'text', textState);

                // update current brick
                this.scope.text = this.scope.text.slice(0, sel.baseOffset);

                this.saveCurrentState();
            }
        }
    }

    private isTag() {
        return this.scope.text && this.scope.text[0] === '/' && this.wallApi.core.isRegisteredBrick(this.scope.text.slice(1));
    }
}