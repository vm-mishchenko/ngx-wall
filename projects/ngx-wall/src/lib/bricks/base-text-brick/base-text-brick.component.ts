import {ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {DeepLeftNodeChild} from '../../modules/utils/deep-left-node-child';
import {DeepRightNodeChild} from '../../modules/utils/deep-right-node-child';
import {FirstSubStringNode} from '../../modules/utils/first-sub-string-node';
import {CaretStartEndPosition} from '../../modules/utils/node/caret-start-end-position';
import {CursorLeftCoordinate} from '../../modules/utils/node/cursor-left-coordinate';
import {CursorPositionInLine} from '../../modules/utils/node/cursor-position-in-line';
import {PlaceCaretToPosition} from '../../modules/utils/node/place-caret-to-position';
import {StringWithoutEmptyNodes} from '../../modules/utils/node/string-without-empty-nodes';
import {IFocusContext, IOnWallFocus, IOnWallStateChange, IWallComponent, IWallModel, IWallUiApi} from '../../wall/wall';
import {
    BACK_SPACE_KEY,
    BACK_SPACE_KEY_CODE_ANDROID,
    BOTTOM_KEY,
    DELETE_KEY,
    ENTER_KEY,
    ENTER_KEY_CODE_ANDROID,
    ESCAPE_KEY,
    FOCUS_INITIATOR,
    LEFT_KEY,
    NUMPUB_ENTER_KEY,
    RIGHT_KEY,
    TAB_KEY,
    TOP_KEY
} from './base-text-brick.constant';
import {IBaseTextState} from './base-text-state.interface';
import {BottomKeyHandler} from './keypress-handlers/bottom-key.handler';
import {EnterKeyHandler} from './keypress-handlers/enter-key.handler';
import {LeftKeyHandler} from './keypress-handlers/left-key.handler';
import {RightKeyHandler} from './keypress-handlers/right-key.handler';
import {TopKeyHandler} from './keypress-handlers/top-key.handler';

enum LineType {
    first = 'FIRST',
    last = 'LAST'
}

export interface ICursorPositionInLine {
    isOnLastLine: boolean;
    isOnFirstLine: boolean;
}

export abstract class BaseTextBrickComponent implements OnInit, OnDestroy, IOnWallStateChange, IOnWallFocus, IWallComponent {
    @Input() id: string;
    @Input() state: IBaseTextState;
    @Input() wallModel: IWallModel;

    @Output() stateChanges: EventEmitter<IBaseTextState> = new EventEmitter();

    @ViewChild('editor') editor: ElementRef;

    keypressHandlers = {
        top: new TopKeyHandler(this),
        enter: new EnterKeyHandler(this),
        left: new LeftKeyHandler(this),
        right: new RightKeyHandler(this),
        bottom: new BottomKeyHandler(this)
    };

    wallUiApi: IWallUiApi;

    scope: IBaseTextState = {
        text: '',
        tabs: 0
    };

    maxTabNumber = 3;

    textChange: Subject<string> = new Subject();

    textChangeSubscription: Subscription;

    onPasteBound: (e: ClipboardEvent) => any;

    ngOnInit() {
        if (this.state && this.state.text !== this.scope.text) {
            this.setTextState(this.state.text);
        }

        this.scope.tabs = this.state.tabs || 0;

        this.onPasteBound = this.onPaste.bind(this);

        this.editor.nativeElement.addEventListener('paste', this.onPasteBound);

        this.textChangeSubscription = this.textChange.subscribe(() => {
            this.setTextState(this.scope.text);
            this.saveCurrentState();
        });

        this.wallUiApi = this.wallModel.api.ui;
    }

    onWallStateChange(newState: IBaseTextState) {
        this.scope.tabs = this.state.tabs || this.scope.tabs;

        if (newState && newState.text !== this.scope.text) {
            this.setTextState(newState.text);
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
            // todo: add interface for UI api
            textArr.reverse().forEach((text) => this.wallModel.api.core.addBrickAfterBrickId(this.id, 'text', {text}));
        }
    }

    onTextChange() {
        this.textChange.next(this.scope.text);
    }

    // general handler of all key events
    onKeyPress(e: KeyboardEvent) {
        if (this.noMetaKeyIsPressed(e)) {
            if (e.code === TOP_KEY) {
                this.topKeyPressed(e);
            }

            if (e.code === BOTTOM_KEY) {
                this.bottomKeyPressed(e);
            }

            if (e.code === LEFT_KEY && this.isCaretAtStart()) {
                this.leftKeyPressed(e);
            }

            if (e.code === RIGHT_KEY && this.isCaretAtEnd()) {
                this.rightKeyPressed(e);
            }

            if (e.code === ENTER_KEY || e.keyCode === ENTER_KEY_CODE_ANDROID || e.code === NUMPUB_ENTER_KEY) {
                this.enterKeyPressed(e);
            }

            if (e.keyCode === ESCAPE_KEY) {
                this.escapeKeyPressed(e);
            }

            if ((e.code === BACK_SPACE_KEY || e.keyCode === BACK_SPACE_KEY_CODE_ANDROID) && !this.isTextSelected()) {
                this.backSpaceKeyPressed(e);
            }

            if (e.code === DELETE_KEY && this.scope.text.length && this.isCaretAtEnd() && !this.isTextSelected()) {
                this.concatWithNextTextSupportingBrick(e);
            }

            if (e.code === TAB_KEY && this.isCaretAtStart()) {
                this.onTabPressed(e);
            }

            if (e.code === DELETE_KEY && this.scope.text === '') {
                this.onDeleteAndFocusToNext(e);
            }
        }
    }

    proxyToKeyHandler(keyHandlerName: string, e: KeyboardEvent) {
        this.keypressHandlers[keyHandlerName].execute(e);
    }

    // key handler
    topKeyPressed(e: KeyboardEvent) {
        this.proxyToKeyHandler('top', e);
    }

    bottomKeyPressed(e: KeyboardEvent) {
        this.proxyToKeyHandler('bottom', e);
    }

    enterKeyPressed(e: KeyboardEvent) {
        this.proxyToKeyHandler('enter', e);
    }

    leftKeyPressed(e: KeyboardEvent) {
        this.proxyToKeyHandler('left', e);
    }

    rightKeyPressed(e) {
        this.proxyToKeyHandler('right', e);
    }

    escapeKeyPressed(e: KeyboardEvent) {
        // do nothing
    }

    onTabPressed(e: KeyboardEvent) {
        e.preventDefault();

        this.increaseTab();
        this.saveCurrentState();
    }

    backSpaceKeyPressed(e: KeyboardEvent) {
        if (this.isCaretAtStart()) {
            if (this.scope.tabs) {
                this.decreaseTab();
                this.saveCurrentState();
            } else {
                if (this.scope.text.length) {
                    this.concatWithPreviousTextSupportingBrick(e);
                } else {
                    this.onDeleteAndFocusToPrevious(e);
                }
            }
        }
    }

    // end key handlers

    isCaretAtFirstLine(): boolean {
        return this.getCursorPositionInLine().isOnFirstLine;
    }

    isCaretAtLastLine(): boolean {
        return this.getCursorPositionInLine().isOnLastLine;
    }

    getCaretLeftCoordinate(): number {
        const sel = window.getSelection();
        const leftRightText = this.getSplittedText(sel.focusOffset, sel.focusNode);

        return (new CursorLeftCoordinate(leftRightText.left, leftRightText.right, this.editor.nativeElement)).get();
    }

    getCursorPositionInLine(): ICursorPositionInLine {
        const sel = window.getSelection();
        const leftRightText = this.getSplittedText(sel.focusOffset, sel.focusNode);

        return new CursorPositionInLine(leftRightText.left, leftRightText.right, this.editor.nativeElement);
    }

    concatWithPreviousTextSupportingBrick(e) {
        const previousTextBrickId = this.wallModel.api.core.getPreviousTextBrickId(this.id);

        if (previousTextBrickId) {
            e.preventDefault();

            const previousBrickSnapshot = this.wallModel.api.core.getBrickSnapshot(previousTextBrickId);

            this.wallModel.api.core.updateBrickState(previousTextBrickId, {
                text: this.cleanUpText(previousBrickSnapshot.state.text) + this.scope.text
            });

            // wait for component re-rendering
            setTimeout(() => {
                const focusContext: IFocusContext = {
                    initiator: FOCUS_INITIATOR,
                    details: {
                        concatText: true,
                        concatenationText: this.scope.text
                    }
                };

                this.wallUiApi.focusOnBrickId(previousTextBrickId, focusContext);

                // remove only after focus will be established
                // that prevents flickering on mobile
                this.wallUiApi.removeBrick(this.id);
            });
        }
    }

    concatWithNextTextSupportingBrick(e: Event) {
        const nextTextBrickId = this.wallModel.api.core.getNextTextBrickId(this.id);

        if (nextTextBrickId) {
            e.preventDefault();

            const nextTextBrickSnapshot = this.wallModel.api.core.getBrickSnapshot(nextTextBrickId);

            const concatenationText = nextTextBrickSnapshot.state.text || '';

            this.setTextState(this.scope.text + concatenationText);

            this.saveCurrentState();

            this.wallModel.api.core.removeBrick(nextTextBrickId);

            setTimeout(() => {
                this.placeCaretBaseOnConcatenatedText(concatenationText);
            }, 10);
        }
    }

    onDeleteAndFocusToPrevious(e: KeyboardEvent) {
        e.preventDefault();

        const previousTextBrickId = this.wallModel.api.core.getPreviousTextBrickId(this.id);

        this.wallUiApi.removeBrick(this.id);

        if (previousTextBrickId) {
            const focusContext: IFocusContext = {
                initiator: FOCUS_INITIATOR,
                details: {
                    deletePreviousText: true
                }
            };

            this.wallUiApi.focusOnBrickId(previousTextBrickId, focusContext);
        }
    }

    onDeleteAndFocusToNext(e: KeyboardEvent) {
        e.preventDefault();

        const nextTextBrickId = this.wallModel.api.core.getNextTextBrickId(this.id);

        if (nextTextBrickId) {
            this.wallUiApi.removeBrick(this.id);

            const focusContext: IFocusContext = {
                initiator: FOCUS_INITIATOR,
                details: {
                    deletePreviousText: true
                }
            };

            this.wallUiApi.focusOnBrickId(nextTextBrickId, focusContext);
        }
    }

    getSplittedText(offset: number, target: Node): { left: string, right: string } {
        return {
            left: this.scope.text.slice(0, offset),
            right: this.scope.text.slice(offset) || ''
        };
    }

    // key handler end
    onWallFocus(context?: IFocusContext): void {
        if (this.editor.nativeElement !== document.activeElement) {
            // focus by API call
            this.editor.nativeElement.focus();

            if (context && context.initiator === FOCUS_INITIATOR) {
                if (context.details.deletePreviousText) {
                    this.placeCaretAtEnd();
                }

                if (context.details.concatText) {
                    this.placeCaretBaseOnConcatenatedText(context.details.concatenationText);
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
    }

    setTextState(text: string = '') {
        this.scope.text = this.cleanUpText(text);
    }

    increaseTab() {
        if (this.scope.tabs < this.maxTabNumber) {
            this.scope.tabs++;
        }
    }

    decreaseTab() {
        if (this.scope.tabs > 0) {
            this.scope.tabs--;
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
        (new PlaceCaretToPosition(el, position)).place();
    }

    // find the node which contains concatenated text and position in this node where cursor should be placed
    placeCaretBaseOnConcatenatedText(concatenationText: string) {
        if (concatenationText !== '') {
            // find first level nodes for the text that was concatenated
            const subStringNodes = new FirstSubStringNode(
                this.editor.nativeElement,
                concatenationText
            );

            // first level node which contains concatenated text
            const firstLevelSubStringNode = subStringNodes.firstLevelSubStringNodes[0];

            if (firstLevelSubStringNode) {
                let focusNode;
                let position;

                if (firstLevelSubStringNode.nodeType === Node.TEXT_NODE) {
                    // if first concatenated node is TEXT_NODE it might
                    // be automatically concatenated with previous existing TEXT_NODE
                    focusNode = firstLevelSubStringNode;

                    // find text content for first concatenated TEXT_NODE
                    const p = document.createElement('P');
                    p.innerHTML = concatenationText;
                    const firstLevelSubStringTextContent = p.childNodes[0].textContent;

                    // finally find cursor position
                    position = focusNode.textContent.length - firstLevelSubStringTextContent.length;
                } else {
                    focusNode = new DeepLeftNodeChild(firstLevelSubStringNode).child;

                    position = 0;
                }

                this.placeCaretAtNodeToPosition(focusNode, position);
            }
        }
    }

    placeCaretAtLeftCoordinate(leftCoordinate: number, line: string) {
        // todo: find the way to set caret based on coordinate number
        if (line === LineType.last) {
            this.placeCaretAtEnd();
        } else {
            this.placeCaretAtStart();
        }
    }

    isCaretAtStart(): boolean {
        return (new CaretStartEndPosition(this.editor.nativeElement)).isCaretAtStart();
    }

    isCaretAtEnd(): boolean {
        return (new CaretStartEndPosition(this.editor.nativeElement)).isCaretAtEnd();
    }

    // remove all unnecessary tags
    cleanUpText(text: string): string {
        return (new StringWithoutEmptyNodes(text)).get();
    }

    private noMetaKeyIsPressed(e): boolean {
        return !((e.shiftKey || e.altKey || e.ctrlKey || e.metaKey));
    }
}
