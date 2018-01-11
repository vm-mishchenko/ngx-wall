import { ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import 'rxjs/add/operator/debounceTime';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { WallApi } from '../wall';
import { IFocusContext } from '../wall/components/wall';
import { FOCUS_INITIATOR } from './base-text-brick.constant';
import { IBaseTextState } from './base-text-state.interface';
import { IStringInfo } from './string-info.interface';

enum LineType {
    first = 'FIRST',
    last = 'LAST'
}

export abstract class BaseTextBrickComponent implements OnInit, OnDestroy {
    @Input() id: string;
    @Input() state: Observable<IBaseTextState>;

    @Output() stateChanges: EventEmitter<IBaseTextState> = new EventEmitter();

    @ViewChild('editor') editor: ElementRef;

    stringInfo: IStringInfo;

    scope: IBaseTextState = {
        text: ''
    };

    textChange: Subject<string> = new Subject();

    textChangeSubscription: Subscription;

    constructor(public wallApi: WallApi) {
    }

    ngOnInit() {
        this.state.subscribe((newState) => {
            if (newState && newState.text !== this.scope.text) {
                this.scope.text = newState.text || '';
            }
        });

        setTimeout(() => {
            this.stringInfo = this.getStringInfo();
        });

        this.editor.nativeElement.addEventListener('paste', this.onPaste.bind(this), false);

        this.textChangeSubscription = this.textChange.debounceTime(350).subscribe(() => {
            this.saveCurrentState();

            this.stringInfo = this.getStringInfo();
        });
    }

    ngOnDestroy() {
        this.textChangeSubscription.unsubscribe();
    }

    onPaste(e: ClipboardEvent) {
        e.preventDefault();

        const textArr = e.clipboardData.getData('text/plain')
            .split('\n')
            .map((str) => str.trim())
            .filter((str) => str.length);

        if (textArr.length === 1) {
            document.execCommand('insertHTML', false, textArr[0]);
        } else if (textArr.length > 1) {
            textArr.reverse().forEach((text) => this.wallApi.core.addBrickAfterBrickId(this.id, 'text', {text}));
        }
    }

    onTextChange() {
        this.textChange.next();
    }

    onKeyPress(e: any) {
        const ENTER_KEY = 13;
        const DELETE_KEY = 46;
        const BACK_SPACE_KEY = 8;
        const LEFT_KEY = 37;
        const TOP_KEY = 38;
        const RIGHT_KEY = 39;
        const BOTTOM_KEY = 40;

        if (this.noMetaKeyIsPressed(e)) {
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

            if (e.keyCode === DELETE_KEY && this.isCaretAtEnd() && !this.isTextSelected()) {
                this.concatWithNextTextSupportingBrick(e);
            }

            if ((e.keyCode === BACK_SPACE_KEY || e.keyCode === DELETE_KEY) && this.scope.text === '') {
                this.onDeleteBrick(e);
            }

            if (e.keyCode === ENTER_KEY) {
                this.enterKeyPressed(e);
            }
        }
    }

    // key handler
    topKeyPressed(e: Event) {
        const caretPosition = this.getCaretPosition();
        const caretLeftCoordinate = this.getCaretLeftCoordinate();

        if (this.isCaretAtFirstLine()) {
            e.preventDefault();

            const focusContext: IFocusContext = {
                initiator: FOCUS_INITIATOR,
                details: {
                    topKey: true,
                    caretPosition,
                    caretLeftCoordinate
                }
            };

            this.wallApi.core.focusOnPreviousTextBrick(this.id, focusContext);
        }
    }

    bottomKeyPressed(e: Event) {
        const caretPosition = this.getCaretPosition();
        const caretLeftCoordinate = this.getCaretLeftCoordinate();

        if (this.isCaretAtLastLine()) {
            e.preventDefault();

            const focusContext: IFocusContext = {
                initiator: FOCUS_INITIATOR,
                details: {
                    bottomKey: true,
                    caretPosition,
                    caretLeftCoordinate
                }
            };

            this.wallApi.core.focusOnNextTextBrick(this.id, focusContext);
        }
    }

    isCaretAtFirstLine(): boolean {
        if (this.stringInfo.countOfLines === 1) {
            return true;
        } else {
            return this.getCaretPosition() < this.stringInfo.breakIndexes[0];
        }
    }

    isCaretAtLastLine(): boolean {
        if (this.stringInfo.countOfLines === 1) {
            return true;
        } else {
            return this.getCaretPosition() >= this.stringInfo.breakIndexes[this.stringInfo.breakIndexes.length - 1];
        }
    }

    getCaretLeftCoordinate(): number {
        const carPos = this.getCaretPosition();
        const div = this.createElementClone();
        const span = document.createElement('SPAN');

        div.style.position = 'absolute';
        document.body.appendChild(div);

        div.textContent = this.scope.text.substr(0, carPos);
        span.textContent = this.scope.text.substr(carPos) || '.';

        div.appendChild(span);

        const leftCoordinate = span.offsetLeft;

        div.remove();

        return leftCoordinate;
    }

    getStringInfo(): IStringInfo {
        const info = {
            countOfLines: 1,
            breakIndexes: []
        };

        const div = this.createElementClone();

        document.body.appendChild(div);

        let currentHeight = div.offsetHeight;

        div.style.height = 'auto';

        let lastCaretPosition = this.scope.text.length;

        while (lastCaretPosition !== 0) {
            div.textContent = this.scope.text.substr(0, lastCaretPosition);

            if (div.offsetHeight < currentHeight) {
                info.countOfLines++;
                info.breakIndexes.push(lastCaretPosition);

                currentHeight = div.offsetHeight;
            }

            lastCaretPosition--;
        }

        div.remove();

        info.breakIndexes.reverse();

        return info;
    }

    leftKeyPressed(e: Event) {
        e.preventDefault();

        const focusContext: IFocusContext = {
            initiator: FOCUS_INITIATOR,
            details: {
                leftKey: true
            }
        };

        this.wallApi.core.focusOnPreviousTextBrick(this.id, focusContext);
    }

    rightKeyPressed(e) {
        e.preventDefault();

        const focusContext: IFocusContext = {
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

            const focusContext: IFocusContext = {
                initiator: FOCUS_INITIATOR,
                details: {
                    concatText: true,
                    caretPosition
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

            this.scope.text += nextTextBrickSnapshot.state.text || '';

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
            const focusContext: IFocusContext = {
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
            text: this.scope.text.slice(sel.focusOffset)
        };

        this.wallApi.core.addBrickAfterBrickId(this.id, 'text', textState);

        // update current brick
        this.scope.text = this.scope.text.slice(0, sel.focusOffset);

        this.saveCurrentState();
    }

    // key handler end
    onWallFocus(context?: IFocusContext): void {
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
                const line = context.details.bottomKey ? LineType.first : LineType.last;

                this.placeCaretAtLeftCoordinate(context.details.caretLeftCoordinate, line);
            }
        }
    }

    saveCurrentState() {
        this.stateChanges.emit(this.scope);
    }

    // caret helpers
    getCaretPosition() {
        const sel = window.getSelection();

        if (sel.rangeCount) {
            return sel.getRangeAt(0).endOffset;
        }
    }

    isTextSelected(): boolean {
        return !window.getSelection().isCollapsed;
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

    placeCaretAtLeftCoordinate(leftCoordinate: number, line: string) {
        this.placeCaretAtPosition(this.getCaretPositionByLeftCaretCoordinate(leftCoordinate, line));
    }

    getCaretPositionByLeftCaretCoordinate(caretCoordinate: number, line: string): number {
        const span = document.createElement('SPAN');
        const div = this.createElementClone();

        div.style.position = 'absolute';
        document.body.appendChild(div);

        let currentLeftPosition = -1;
        let currentCaretPosition;

        if (this.stringInfo.countOfLines > 1 && line === LineType.last) {
            currentCaretPosition = this.stringInfo.breakIndexes[this.stringInfo.breakIndexes.length - 1];
        } else {
            currentCaretPosition = 0;
        }

        while (currentLeftPosition < caretCoordinate && this.scope.text.length > currentCaretPosition) {
            if (currentLeftPosition !== -1) {
                div.removeChild(span);
            }

            div.textContent = this.scope.text.substr(0, currentCaretPosition);
            span.textContent = this.scope.text.substr(currentCaretPosition) || '.';

            div.appendChild(span);

            currentLeftPosition = span.offsetLeft;
            currentCaretPosition++;
        }

        currentCaretPosition--; // compensate the last while digest

        div.remove();

        if (currentLeftPosition === caretCoordinate) {
            // caret stay on the right position
            return currentCaretPosition;
        } else if (this.scope.text.length - 1 === currentCaretPosition) {
            // we reach the limit of available symbols
            return this.scope.text.length;
        } else {
            return currentCaretPosition;
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
            atStart = (testRange.toString().trim() === '');
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
            atEnd = (testRange.toString().trim() === '');
        }

        return atEnd;
    }

    createElementClone(): HTMLElement {
        const div = document.createElement('DIV');

        const style = getComputedStyle(this.editor.nativeElement);

        [].forEach.call(style, (prop) => {
            div.style[prop] = style[prop];
        });

        return div;
    }

    noMetaKeyIsPressed(e): boolean {
        return !((e.shiftKey || e.altKey || e.ctrlKey || e.metaKey));
    }
}