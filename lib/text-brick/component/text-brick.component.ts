import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { onWallFocus, WallApi } from '../../wall';

@Component({
    selector: 'text-brick',
    templateUrl: './text-brick-component.component.html'
})
export class TextBrickComponent implements OnInit, onWallFocus {
    @Input() id: string;

    @ViewChild('editor') editor: ElementRef;

    state: any = {};

    store: any = null;

    constructor(private wallApi: WallApi, private el: ElementRef) {
    }

    ngOnInit() {
        this.store = this.wallApi.core.getBrickStore(this.id);

        this.state = this.store.get();

        this.state.text = this.state.text || '';

        this.editor.nativeElement.innerText = this.state.text;
    }

    onTextChanged() {
        this.state.text = this.editor.nativeElement.innerText;

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

        if ((e.keyCode === BACK_SPACE_KEY || e.keyCode === DELETE_KEY) && this.state.text === '') {
            e.preventDefault();

            this.wallApi.core.removeBrick(this.id);
        }

        if (e.keyCode === ENTER_KEY) {
            e.preventDefault();

            if (this.state.text[0] === '/') {
                const tag = this.state.text.slice(1);

                if (this.wallApi.core.isRegisteredBrick(tag)) {
                    this.wallApi.core.turnBrickInto(this.id, this.state.text.slice(1));

                    // d - divider tag
                    if (tag === 'd') {
                        this.wallApi.core.addBrickAfterBrickId(this.id, 'text');
                    }
                } else {
                    this.wallApi.core.addBrickAfterBrickId(this.id, 'text');
                }
            } else {
                this.wallApi.core.addBrickAfterBrickId(this.id, 'text');
            }
        }
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
        this.store.set(this.state);
    }
}