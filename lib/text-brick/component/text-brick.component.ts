import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { onWallFocus, WallApi } from '../../wall';
import { TextBrickState } from '../text-brick-state.interface';

@Component({
    selector: 'text-brick',
    templateUrl: './text-brick-component.component.html'
})
export class TextBrickComponent implements OnInit, onWallFocus {
    @Input() id: string;

    @Input() state: Observable<TextBrickState | null>;

    @Output() stateChanges: EventEmitter<TextBrickState> = new EventEmitter();

    @ViewChild('editor') editor: ElementRef;

    scope: TextBrickState = {
        text: ''
    };

    constructor(private wallApi: WallApi) {
    }

    ngOnInit() {
        this.state.subscribe((newState) => {
            if (newState && newState.text !== this.scope.text) {
                this.scope.text = newState.text || '';

                this.editor.nativeElement.innerText = this.scope.text;
            }
        });
    }

    onTextChanged() {
        this.scope.text = this.editor.nativeElement.innerText;

        this.save();
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
            this.wallApi.core.focusOnPreviousTextBrick(this.id);
        }

        if (e.keyCode === BOTTOM_KEY) {
            this.wallApi.core.focusOnNextTextBrick(this.id);
        }

        if (e.keyCode === LEFT_KEY && this.isCaretAtStart()) {
            this.wallApi.core.focusOnPreviousTextBrick(this.id);
        }

        if (e.keyCode === RIGHT_KEY && this.isCaretAtEnd()) {
            this.wallApi.core.focusOnNextTextBrick(this.id);
        }

        if ((e.keyCode === BACK_SPACE_KEY || e.keyCode === DELETE_KEY) && this.scope.text === '') {
            e.preventDefault();

            this.wallApi.core.removeBrick(this.id);
        }

        if (e.keyCode === ENTER_KEY) {
            e.preventDefault();

            /*const sel = window.getSelection();

            console.log(this.scope.text.slice(0, sel.focusOffset));*/

            if (this.isTag()) {
                const newTag = this.scope.text.slice(1);

                this.wallApi.core.turnBrickInto(this.id, newTag);

                // d - divider tag
                // if there is divider tag - after it automatically add text tag
                if (newTag === 'd') {
                    this.wallApi.core.addBrickAfterBrickId(this.id, 'text');
                }
            } else {
                const sel = window.getSelection();

                const initialTextState = {
                    text: this.scope.text.slice(sel.baseOffset)
                };

                this.wallApi.core.addBrickAfterBrickId(this.id, 'text', initialTextState);

                // update current brick
                this.scope.text = this.scope.text.slice(0, sel.baseOffset);

                this.save();
            }
        }
    }

    isTag(): boolean {
        return this.scope.text &&
            this.scope.text[0] === '/' &&
            this.wallApi.core.isRegisteredBrick(this.scope.text.slice(1));
    }

    onWallFocus(): void {
        this.editor.nativeElement.focus();
        this.placeCaretAtEnd();
    }

    placeCaretAtEnd() {
        // place caret at the end
        // https://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
        if (typeof window.getSelection != 'undefined' && typeof document.createRange != 'undefined') {
            const range = document.createRange();

            range.selectNodeContents(this.editor.nativeElement);
            range.collapse(false);

            const sel = window.getSelection();

            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    isCaretAtStart(): boolean {
        let atStart = false;

        const sel = window.getSelection();

        if (sel.rangeCount) {
            const selRange = sel.getRangeAt(0);
            const testRange = selRange.cloneRange();

            testRange.selectNodeContents(this.editor.nativeElement);
            testRange.setEnd(selRange.startContainer, selRange.startOffset);
            atStart = (testRange.toString() == '');
        }

        return atStart;
    }

    isCaretAtEnd(): boolean {
        let atEnd = false;

        const sel = window.getSelection();

        if (sel.rangeCount) {
            const selRange = sel.getRangeAt(0);
            const testRange = selRange.cloneRange();

            testRange.selectNodeContents(this.editor.nativeElement);
            testRange.setStart(selRange.endContainer, selRange.endOffset);
            atEnd = (testRange.toString() == '');
        }

        return atEnd;
    }

    save() {
        this.stateChanges.emit(this.scope);
    }
}