import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { onWallFocus, WallApi } from '../../wall';
import { Observable } from 'rxjs/Observable';
import { TextBrickState } from '../text-brick-state.interface';
import { FocusContext } from "../../wall/components/wall";

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
            }
        });
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
                const previousBreakSnapshot = this.wallApi.core.getBrickSnapshot(previousTextBrickId);

                const caretPosition = previousBreakSnapshot.state.text.length;

                this.wallApi.core.updateBrickState(previousTextBrickId, {
                    text: previousBreakSnapshot.state.text + this.scope.text
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

        if ((e.keyCode === BACK_SPACE_KEY || e.keyCode === DELETE_KEY) && this.scope.text === '') {
            e.preventDefault();

            this.wallApi.core.removeBrick(this.id);
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

    onWallFocus(context?: FocusContext): void {
        this.editor.nativeElement.focus();

        if (context && context.initiator === 'text-brick') {
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

    private placeCaretAtStart(): void {
        this.placeCaretAtPosition(0);
    }

    private placeCaretAtEnd(): void {
        this.placeCaretAtPosition(this.scope.text.length);
    }

    private placeCaretAtPosition(position: number) {
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

    private getCaretPosition() {
        const sel = window.getSelection();

        if (sel.rangeCount) {
            return sel.getRangeAt(0).endOffset;
        }
    }

    private isTag() {
        return this.scope.text && this.scope.text[0] === '/' && this.wallApi.core.isRegisteredBrick(this.scope.text.slice(1));
    }

    private saveCurrentState() {
        this.stateChanges.emit(this.scope);
    }
}