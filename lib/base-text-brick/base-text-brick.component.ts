import { ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { FocusContext } from "../wall/components/wall";

export interface BaseTextState {
    text: string
}

export abstract class BaseTextBrickComponent implements OnInit {
    @Input() id: string;
    @Input() state: Observable<BaseTextState>;

    @Output() stateChanges: EventEmitter<BaseTextState> = new EventEmitter();

    @ViewChild('editor') editor: ElementRef;

    scope: BaseTextState = {
        text: ''
    };

    constructor() {
    }

    ngOnInit() {
        this.state.subscribe((newState) => {
            if (newState && newState.text !== this.scope.text) {
                this.scope.text = newState.text || '';
            }
        });
    }

    onWallFocus(context?: FocusContext): void {
        this.editor.nativeElement.focus();

        if (context && context.initiator === 'text-brick') {
            if (context.details.deletePreviousText) {
                this.placeCaretAtEnd();
            }

            if (context.details.concatText) {
                this.placeCaretAtPosition(context.details.caretPosition);
            }

            if (context.details.leftKey) {
                this.placeCaretAtEnd();
            }

            if (context.details.rightKey) {
                this.placeCaretAtStart();
            }

            if (context.details.bottomKey || context.details.topKey) {
                this.placeCaretAtPosition(context.details.caretPosition);
            }
        }
    }

    saveCurrentState() {
        this.stateChanges.emit(this.scope);
    }

    getCaretPosition() {
        const sel = window.getSelection();

        if (sel.rangeCount) {
            return sel.getRangeAt(0).endOffset;
        }
    }

    placeCaretAtStart(): void {
        this.placeCaretAtPosition(0);
    }

    placeCaretAtEnd(): void {
        this.placeCaretAtPosition(this.scope.text.length);
    }

    placeCaretAtPosition(position: number) {
        if (this.scope.text.length) {
            const el = this.editor.nativeElement;

            const range = document.createRange();
            const sel = window.getSelection();

            // position might be less than text length
            if (this.scope.text.length < position) {
                position = this.scope.text.length;
            }

            range.setStart(el.firstChild, position);

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
}