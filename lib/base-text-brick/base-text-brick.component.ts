import { ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import 'rxjs/add/operator/debounceTime';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { DeepLeftNodeChild } from '../modules/utils/deep-left-node-child';
import { DeepRightNodeChild } from '../modules/utils/deep-right-node-child';
import { FirstSubStringNode } from '../modules/utils/first-sub-string-node';
import { IFocusContext, IOnWallFocus, IOnWallStateChange, WallApi } from '../wall';
import { FOCUS_INITIATOR } from './base-text-brick.constant';
import { IBaseTextState } from './base-text-state.interface';

enum LineType {
    first = 'FIRST',
    last = 'LAST'
}

export interface IBreakLineInfo {
    countOfLines: number;
    breakIndexes: number[];
}

export interface ICursorPositionInLine {
    isOnLastLine: boolean;
    isOnFirstLine: boolean;
}

export abstract class BaseTextBrickComponent implements OnInit, OnDestroy, IOnWallStateChange, IOnWallFocus {
    @Input() id: string;
    @Input() state: IBaseTextState;

    @Output() stateChanges: EventEmitter<IBaseTextState> = new EventEmitter();

    @ViewChild('editor') editor: ElementRef;

    scope: IBaseTextState = {
        text: ''
    };

    textChange: Subject<string> = new Subject();

    textChangeSubscription: Subscription;

    onPasteBound: any;

    constructor(public wallApi: WallApi) {
    }

    ngOnInit() {
        if (this.state && this.state.text !== this.scope.text) {
            this.scope.text = this.state.text || '';
        }

        this.onPasteBound = this.onPaste.bind(this);

        this.editor.nativeElement.addEventListener('paste', this.onPasteBound);

        this.textChangeSubscription = this.textChange.debounceTime(100)
            .subscribe(() => {
                this.saveCurrentState();
            });
    }

    onWallStateChange(newState: IBaseTextState) {
        if (newState && newState.text !== this.scope.text) {
            this.scope.text = newState.text || '';
        }
    }

    ngOnDestroy() {
        this.editor.nativeElement.removeEventListener('paste', this.onPasteBound);
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
        this.textChange.next(this.scope.text);
    }

    onKeyPress(e: KeyboardEvent) {
        const ENTER_KEY = 13;
        const DELETE_KEY = 46;
        const BACK_SPACE_KEY = 8;
        const LEFT_KEY = 37;
        const TOP_KEY = 38;
        const RIGHT_KEY = 39;
        const BOTTOM_KEY = 40;
        const ESCAPE_KEY = 27;

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

            if (e.keyCode === BACK_SPACE_KEY && this.isCaretAtStart() &&
                this.scope.text.length && !this.isTextSelected()) {
                this.concatWithPreviousTextSupportingBrick(e);
            }

            if (e.keyCode === DELETE_KEY && this.isCaretAtEnd() && !this.isTextSelected() && this.scope.text.length) {
                this.concatWithNextTextSupportingBrick(e);
            }

            if (this.scope.text === '') {
                if (e.keyCode === BACK_SPACE_KEY) {
                    this.onDeleteAndFocusToPrevious(e);
                }

                if (e.keyCode === DELETE_KEY) {
                    this.onDeleteAndFocusToNext(e);
                }
            }

            if (e.keyCode === ENTER_KEY) {
                this.enterKeyPressed(e);
            }

            if (e.keyCode === ESCAPE_KEY) {
                this.escapeKeyPressed(e);
            }
        }
    }

    // key handler
    topKeyPressed(e: KeyboardEvent) {
        const caretLeftCoordinate = this.getCaretLeftCoordinate();

        if (this.isCaretAtFirstLine()) {
            e.preventDefault();

            const focusContext: IFocusContext = {
                initiator: FOCUS_INITIATOR,
                details: {
                    topKey: true,
                    caretLeftCoordinate
                }
            };

            this.wallApi.core.focusOnPreviousTextBrick(this.id, focusContext);
        }
    }

    bottomKeyPressed(e: KeyboardEvent) {
        if (this.isCaretAtLastLine()) {
            e.preventDefault();

            const caretLeftCoordinate = this.getCaretLeftCoordinate();

            const focusContext: IFocusContext = {
                initiator: FOCUS_INITIATOR,
                details: {
                    bottomKey: true,
                    caretLeftCoordinate
                }
            };

            this.wallApi.core.focusOnNextTextBrick(this.id, focusContext);
        }
    }

    isCaretAtFirstLine(): boolean {
        return this.getCursorPositionInLine().isOnFirstLine;
    }

    isCaretAtLastLine(): boolean {
        return this.getCursorPositionInLine().isOnLastLine;
    }

    getCaretLeftCoordinate(): number {
        const sel = window.getSelection();

        const div = this.createElementClone();
        const span = document.createElement('SPAN');
        const leftRightText = this.getLeftRightText(sel.focusOffset, sel.focusNode);

        div.innerHTML = leftRightText.left;
        span.innerHTML = leftRightText.right;

        div.appendChild(span);

        div.style.position = 'absolute';

        document.body.appendChild(div);

        const leftCoordinate = span.offsetLeft;

        div.remove();

        return leftCoordinate;
    }

    getCursorPositionInLine(): ICursorPositionInLine {
        // http://jsbin.com/qifezupu/31/edit?js,output
        if (!this.scope.text) {
            return {
                isOnLastLine: true,
                isOnFirstLine: true
            };
        } else {
            const div = this.createElementClone();

            document.body.appendChild(div);

            const span1 = document.createElement('SPAN');
            const span2 = document.createElement('SPAN');

            div.appendChild(span1);
            div.appendChild(span2);

            span1.innerText = 'a';

            const lh = span1.offsetHeight;

            const sel = window.getSelection();
            const leftRightText = this.getLeftRightText(sel.focusOffset, sel.focusNode);

            span1.innerHTML = leftRightText.left;
            span2.innerHTML = leftRightText.right;

            const isOnFirstLine = span1.textContent.length === 0 ||
                (span1.offsetHeight === lh && span1.getBoundingClientRect().top === span2.getBoundingClientRect().top);

            const isOnLastLine = span2.offsetHeight === lh;

            div.remove();

            return {
                isOnLastLine,
                isOnFirstLine
            };
        }
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

            const concatenationText = this.scope.text || '';

            this.wallApi.core.updateBrickState(previousTextBrickId, {
                text: (previousBrickSnapshot.state.text || '') + concatenationText
            });

            this.wallApi.core.removeBrick(this.id);

            const focusContext: IFocusContext = {
                initiator: FOCUS_INITIATOR,
                details: {
                    concatText: true,
                    concatenationText
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

            const concatenationText = nextTextBrickSnapshot.state.text || '';

            this.scope.text += concatenationText;

            this.wallApi.core.removeBrick(nextTextBrickId);

            setTimeout(() => {
                this.placeCaretBaseOnConcatenaitedText(concatenationText);
            }, 0);

            this.saveCurrentState();
        }
    }

    onDeleteAndFocusToPrevious(e: KeyboardEvent) {
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

    onDeleteAndFocusToNext(e: KeyboardEvent) {
        e.preventDefault();

        const previousTextBrickId = this.wallApi.core.getNextTextBrickId(this.id);

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

    enterKeyPressed(e: KeyboardEvent) {
        e.preventDefault();

        const sel = window.getSelection();

        const leftRightText = this.getLeftRightText(sel.focusOffset, sel.focusNode);

        const newTextState = {
            text: leftRightText.right
        };

        this.wallApi.core.addBrickAfterBrickId(this.id, 'text', newTextState);

        setTimeout(() => {
            // update current brick
            this.scope.text = leftRightText.left;

            if (newTextState.text.length) {
                this.saveCurrentState();
            }
        }, 0);
    }

    getLeftRightText(offset: number, target: Node): { left: string, right: string } {
        return {
            left: this.scope.text.slice(0, offset),
            right: this.scope.text.slice(offset) || ''
        };
    }

    escapeKeyPressed(e: KeyboardEvent) {
        // do nothing
    }

    // key handler end
    onWallFocus(context?: IFocusContext): void {
        this.editor.nativeElement.focus();

        if (context && context.initiator === FOCUS_INITIATOR) {
            if (context.details.deletePreviousText) {
                this.placeCaretAtEnd();
            }

            if (context.details.concatText) {
                this.placeCaretBaseOnConcatenaitedText(context.details.concatenationText);
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
    isTextSelected(): boolean {
        return !window.getSelection().isCollapsed;
    }

    placeCaretAtStart(): void {
        const deepLeftNode = new DeepLeftNodeChild(this.editor.nativeElement);

        this.placeCaretAtNodeStart(deepLeftNode.child);
    }

    placeCaretAtEnd(): void {
        const rightNode = new DeepRightNodeChild(this.editor.nativeElement);

        this.placeCaretAtNodeEnd(rightNode.child);
    }

    placeCaretAtNodeStart(el: Node) {
        this.placeCaretAtNodeToPosition(el, 0);
    }

    placeCaretAtNodeEnd(el: Node) {
        this.placeCaretAtNodeToPosition(el, el.textContent.length);
    }

    placeCaretAtNodeToPosition(el: Node, position: number) {
        const range = document.createRange();
        const sel = window.getSelection();

        range.setStart(el, position);

        sel.removeAllRanges();
        sel.addRange(range);
    }

    placeCaretBaseOnConcatenaitedText(concatenationText: string) {
        const subStringNodes = new FirstSubStringNode(
            this.editor.nativeElement,
            concatenationText
        );

        const firstLevelSubStringNode = subStringNodes.firstLevelSubStringNodes[0];

        if (firstLevelSubStringNode) {
            let focusNode;
            let position;

            if (subStringNodes.firstLevelSubStringNodes.length === 1 &&
                firstLevelSubStringNode.nodeType === Node.TEXT_NODE) {
                focusNode = firstLevelSubStringNode;

                position = focusNode.textContent.indexOf(concatenationText);
            } else {
                focusNode = new DeepLeftNodeChild(firstLevelSubStringNode).child;

                position = 0;
            }

            this.placeCaretAtNodeToPosition(focusNode, position);
        } else {
            this.placeCaretAtStart();
        }
    }

    placeCaretAtLeftCoordinate(leftCoordinate: number, line: string) {
        // todo: find the way to solve it
        if (line === LineType.last) {
            this.placeCaretAtEnd();
        } else {
            this.placeCaretAtStart();
        }

        // this.placeCaretAtPosition(this.getCaretPositionByLeftCaretCoordinate(leftCoordinate, line));
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

    /*getBreakLineInfo(): IBreakLineInfo {
        const info: IBreakLineInfo = {
            countOfLines: 1,
            breakIndexes: []
        };

        const div = this.createElementClone();

        div.style.visibility = 'hidden';

        document.body.appendChild(div);

        let currentHeight = div.clientHeight;

        div.style.height = 'auto';

        let lastCaretPosition = this.scope.text.length;

        // todo: extra inefficient loop, leads to Layout Thrashing!
        while (lastCaretPosition !== 0) {
            div.textContent = this.scope.text.substr(0, lastCaretPosition);

            if (div.clientHeight < currentHeight) {
                info.countOfLines++;
                info.breakIndexes.push(lastCaretPosition);

                currentHeight = div.clientHeight;
            }

            lastCaretPosition--;
        }

        div.remove();

        info.breakIndexes.reverse();

        return info;
    }*/

    /*

    getCaretPosition() {
        const sel = window.getSelection();

        if (sel.rangeCount) {
            return sel.getRangeAt(0).endOffset;
        }
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
    }*/

    /*getCaretPositionByLeftCaretCoordinate(caretCoordinate: number, line: string): number {
        const span = document.createElement('SPAN');
        const div = this.createElementClone();

        const breakLineInfo = this.getBreakLineInfo();

        div.style.position = 'absolute';
        document.body.appendChild(div);

        let currentLeftPosition = -1;
        let currentCaretPosition;

        if (breakLineInfo.countOfLines > 1 && line === LineType.last) {
            currentCaretPosition = breakLineInfo.breakIndexes[breakLineInfo.breakIndexes.length - 1];
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
    }*/
}
