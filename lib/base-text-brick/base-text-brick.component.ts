import { ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { FocusContext } from "../wall/components/wall";
import { FOCUS_INITIATOR } from "./base-text-brick.constant";
import { WallApi } from "../wall";

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

    constructor(public wallApi: WallApi) {
    }

    ngOnInit() {
        this.state.subscribe((newState) => {
            if (newState && newState.text !== this.scope.text) {
                this.scope.text = newState.text || '';
            }
        });
    }

    onTextChange() {
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
            this.topKeyPressed(e);
        }

        if (e.keyCode === BOTTOM_KEY) {
            this.bottomKeyPressed(e);
        }

        if (e.keyCode === LEFT_KEY && this.isCaretAtStart()) {
            this.leftKeyPressed(e);
        }

        if (e.keyCode === RIGHT_KEY && this.isCaretAtEnd()) {
            this.rightKeyPressed(e);
        }

        if (e.keyCode === BACK_SPACE_KEY && this.isCaretAtStart() && this.scope.text.length) {
            this.concatWithPreviousTextSupportingBrick(e);
        }

        if (e.keyCode === DELETE_KEY && this.isCaretAtEnd()) {
            this.concatWithNextTextSupportingBrick(e);
        }

        if ((e.keyCode === BACK_SPACE_KEY || e.keyCode === DELETE_KEY) && this.scope.text === '') {
            this.onDeleteBrick(e);
        }

        if (e.keyCode === ENTER_KEY) {
            this.enterKeyPressed(e);
        }
    }

    // key handler
    topKeyPressed(e: Event) {
        e.preventDefault();

        const focusContext: FocusContext = {
            initiator: FOCUS_INITIATOR,
            details: {
                topKey: true,
                caretPosition: this.getCaretPosition()
            }
        };

        this.wallApi.core.focusOnPreviousTextBrick(this.id, focusContext);
    }

    bottomKeyPressed(e: Event) {
        e.preventDefault();

        const focusContext: FocusContext = {
            initiator: FOCUS_INITIATOR,
            details: {
                bottomKey: true,
                caretPosition: this.getCaretPosition()
            }
        };

        this.wallApi.core.focusOnNextTextBrick(this.id, focusContext);
    }

    leftKeyPressed(e: Event) {
        e.preventDefault();

        const focusContext: FocusContext = {
            initiator: FOCUS_INITIATOR,
            details: {
                leftKey: true
            }
        };

        this.wallApi.core.focusOnPreviousTextBrick(this.id, focusContext);
    }

    rightKeyPressed(e) {
        e.preventDefault();

        const focusContext: FocusContext = {
            initiator: FOCUS_INITIATOR,
            details: {
                rightKey: true
            }
        };

        this.wallApi.core.focusOnNextTextBrick(this.id, focusContext);
    }

    concatWithPreviousTextSupportingBrick(e) {
        const previousTextBrickId = this.wallApi.core.getPreviousTextBrickId(this.id);

        if (previousTextBrickId) {
            e.preventDefault();

            const previousBrickSnapshot = this.wallApi.core.getBrickSnapshot(previousTextBrickId);

            const caretPosition = previousBrickSnapshot.state.text.length;

            this.wallApi.core.updateBrickState(previousTextBrickId, {
                text: previousBrickSnapshot.state.text + (this.scope.text || '')
            });

            this.wallApi.core.removeBrick(this.id);

            const focusContext: FocusContext = {
                initiator: FOCUS_INITIATOR,
                details: {
                    concatText: true,
                    caretPosition: caretPosition
                }
            };

            this.wallApi.core.focusOnBrickId(previousTextBrickId, focusContext);
        }
    }

    concatWithNextTextSupportingBrick(e: Event) {
        const nextTextBrickId = this.wallApi.core.getNextTextBrickId(this.id);

        if (nextTextBrickId) {
            e.preventDefault();

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

    onDeleteBrick(e: Event) {
        e.preventDefault();

        const previousTextBrickId = this.wallApi.core.getPreviousTextBrickId(this.id);

        this.wallApi.core.removeBrick(this.id);

        if (previousTextBrickId) {
            const focusContext: FocusContext = {
                initiator: FOCUS_INITIATOR,
                details: {
                    deletePreviousText: true
                }
            };

            this.wallApi.core.focusOnBrickId(previousTextBrickId, focusContext);
        }
    }

    enterKeyPressed(e: Event) {
        e.preventDefault();

        const sel = window.getSelection();

        const textState = {
            text: this.scope.text.slice(sel.baseOffset)
        };

        this.wallApi.core.addBrickAfterBrickId(this.id, 'text', textState);

        // update current brick
        this.scope.text = this.scope.text.slice(0, sel.baseOffset);

        this.saveCurrentState();
    }

    // key handler end

    onWallFocus(context?: FocusContext): void {
        this.editor.nativeElement.focus();

        if (context && context.initiator === FOCUS_INITIATOR) {
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