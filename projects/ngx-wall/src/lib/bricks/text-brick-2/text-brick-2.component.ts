import {Component, ComponentFactoryResolver, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {IBaseTextState} from '../base-text-brick/base-text-state.interface';
import {IOnWallStateChange} from '../../wall/components/wall/interfaces/wall-component/on-wall-state-change.interface';
import {IOnWallFocus} from '../../wall/components/wall/interfaces/wall-component/on-wall-focus.interface';
import {IFocusContext} from '../../wall/components/wall/interfaces/wall-component/wall-component-focus-context.interface';
import {EditorView} from 'prosemirror-view';
import {DOMParser, DOMSerializer, Schema} from 'prosemirror-model';
import {StickyModalService} from 'ngx-sticky-modal';
import {toggleMark} from 'prosemirror-commands';
import {keymap} from 'prosemirror-keymap';
import {EditorState} from 'prosemirror-state';
import {
  getHTMLAfterResolvedPos,
  getHTMLBeforeResolvedPos,
  getHTMLRepresentation,
  getTextAfterResolvedPos,
  getTextBeforeResolvedPos,
  isTextSelected,
  setCursorAtTheStart
} from '../../modules/prosemirror/prosemirror';
import {takeUntil} from 'rxjs/operators';
import {IWallModel} from '../../wall/model/interfaces/wall-model.interface';
import {IWallUiApi} from '../../wall/components/wall/interfaces/ui-api.interface';
import {FOCUS_INITIATOR} from '../base-text-brick/base-text-brick.constant';
import {CursorPositionInLine} from '../../modules/utils/node/cursor-position-in-line';

const nodes = {
  doc: {
    // may contains 0 or multiple text nodes
    content: 'inline*'
  },
  text: {
    inline: true,
    group: 'inline',
  },
  star: {
    inline: true,
    group: 'inline',
    toDOM() {
      return ['star', '🟊'];
    },
    parseDOM: [{tag: 'star'}]
  },
};

const marks = {
  suggestion: {
    inclusive: true,
    parseDOM: [{tag: 'suggestion'}],
    toDOM() {
      return ['suggestion', 0];
    }
  },
  highlight: {
    inclusive: false,
    parseDOM: [{tag: 'highlight'}],
    toDOM() {
      return ['highlight', 0];
    }
  },
  em: {
    parseDOM: [
      {
        tag: 'i'
      }, {
        tag: 'em'
      }, {
        style: 'font-style=italic'
      }
    ],
    toDOM() {
      return ['em', 0];
    }
  },
  strong: {
    parseDOM: [
      {
        tag: 'b'
      }, {
        tag: 'strong'
      },
      {
        style: 'font-weight',
        getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
      }
    ],
    toDOM() {
      return ['b', 0];
    }
  },
  link: {
    inclusive: false, // Whether this mark should be active when the cursor is positioned at its ends
    attrs: {
      href: {},
      title: {default: null}
    },
    parseDOM: [{
      tag: 'a[href]', getAttrs(dom) {
        return {
          href: dom.getAttribute('href'),
          title: dom.getAttribute('title')
        };
      }
    }],
    toDOM(node) {
      const {href, title} = node.attrs;

      return ['a', {href, title}, 0];
    }
  }
};

const customSchema = new Schema({nodes, marks});
const serializer = DOMSerializer.fromSchema(customSchema);

@Component({
  selector: 'text-brick2',
  templateUrl: './text-brick2.component.html',
  styleUrls: ['./text-brick2.component.scss']
})
export class TextBrick2Component implements OnInit, OnDestroy, IOnWallStateChange, IOnWallFocus {
  @Input() id: string;
  @Input() state: IBaseTextState;
  @Input() wallModel: IWallModel;
  @Output() stateChanges: EventEmitter<IBaseTextState> = new EventEmitter();

  wallUiApi: IWallUiApi;

  @ViewChild('container') editor: ElementRef;

  // take care of all subscriptions that should be destroyed after component will be destroyed
  private destroyed$ = new Subject();

  private textChange$: Subject<string> = new Subject();
  private view: any;

  constructor(private ngxStickyModalService: StickyModalService,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
    this.wallUiApi = this.wallModel.api.ui;

    this.textChange$.pipe(
      takeUntil(this.destroyed$),
    ).subscribe((html) => {
      console.log(`Save text state`);
      this.stateChanges.emit({
        text: html,
        tabs: 0
      });
    });

    const keymapPlugin = keymap({
      'ArrowUp': this.onArrowUp.bind(this),
      'ArrowDown': this.onArrowDown.bind(this),
      'Enter': this.onEnter.bind(this),
      'Mod-b': toggleMark(customSchema.marks.strong),
      'Mod-B': toggleMark(customSchema.marks.strong),
      'Mod-i': toggleMark(customSchema.marks.em),
      'Mod-I': toggleMark(customSchema.marks.em),
      'Mod-u': toggleMark(customSchema.marks.highlight),
      'Mod-U': toggleMark(customSchema.marks.highlight),
    });

    const domNode = document.createElement('div');
    domNode.innerHTML = this.state.text;

    const state = EditorState.create({
      doc: DOMParser.fromSchema(customSchema).parse(domNode),
      schema: customSchema,
      plugins: [
        keymapPlugin
      ]
    });

    this.view = new EditorView(this.editor.nativeElement, {
      state,
      dispatchTransaction: (transaction) => {
        if (transaction.selectionSet) {
          console.log(`selection was explicitly updated by this transaction.`);
        }

        if (transaction.getMeta('pointer')) {
          console.log(`Transaction caused by mouse or touch input`);
        }

        const newState = this.view.state.apply(transaction);

        // The updateState method is just a shorthand to updating the "state" prop.
        this.view.updateState(newState);

        if (transaction.docChanged) {
          const text = getHTMLRepresentation(newState.doc, serializer);

          // happen when the text was changed outside the component/prose-mirror editor
          if (text === this.state.text) {
            return;
          }

          this.updateText(text);
        }
      },
    });
  }

  onWallStateChange(newState: IBaseTextState) {
    // happen when text is changed internally by prose-mirror component
    if (newState && newState.text === getHTMLRepresentation(this.view.state.doc, serializer)) {
      return;
    }

    const domNode = document.createElement('div');
    domNode.innerHTML = newState.text;
    const doc = DOMParser.fromSchema(customSchema).parse(domNode, {
      preserveWhitespace: true
    });

    this.view.dispatch(
      this.view.state.tr.replaceWith(0, this.view.state.doc.content.size, doc)
    );
  }

  onWallFocus(context?: IFocusContext): void {
    if (this.editor.nativeElement === document.activeElement) {
      return;
    }

    this.editor.nativeElement.firstChild.focus();

    if (context) {

    } else {
      setCursorAtTheStart(this.view.state, this.view.dispatch);
    }
  }

  onEnter() {
    const $cursor = isTextSelected(this.view.state.selection) ?
      this.view.state.selection.$head :
      this.view.state.selection.$cursor;

    const leftHTML = getHTMLBeforeResolvedPos($cursor, serializer);
    const rightHTML = getHTMLAfterResolvedPos($cursor, serializer);

    if (leftHTML.length) {
      if (rightHTML.length) {
        // text is splitted to two part
        this.splitBrickForTwoPart(leftHTML, rightHTML);
      } else {
        // cursor at end - text's exist - create new and focus on it
        this.addEmptyBrickAfter();
      }
    } else {
      if (rightHTML.length) {
        // cursor at start, text exists - just create new line at top, do not move focus
        this.addEmptyTextBrickBefore();
      } else {
        // there are no text at all - create new and focus on it
        this.addEmptyBrickAfter();
      }
    }

    return true;
  }

  onArrowUp() {
    const $cursor = isTextSelected(this.view.state.selection) ?
      this.view.state.selection.$head :
      this.view.state.selection.$cursor;

    const leftText = getTextBeforeResolvedPos($cursor);
    const rightText = getTextAfterResolvedPos($cursor);

    const cursorPositionInLine = new CursorPositionInLine(leftText, rightText, this.editor.nativeElement);

    if (!cursorPositionInLine.isOnFirstLine) {
      return;
    }

    const focusContext: IFocusContext = {
      initiator: FOCUS_INITIATOR,
      details: {
        topKey: true,
        caretLeftCoordinate: null
      }
    };

    this.wallUiApi.mode.edit.focusOnPreviousTextBrick(this.id, focusContext);

    // means that this function will handle the key event, so prose mirror
    // will call preventDefault internally
    return true;
  }

  onArrowDown() {
    const $cursor = isTextSelected(this.view.state.selection) ?
      this.view.state.selection.$head :
      this.view.state.selection.$cursor;

    const leftText = getTextBeforeResolvedPos($cursor);
    const rightText = getTextAfterResolvedPos($cursor);

    const cursorPositionInLine = new CursorPositionInLine(leftText, rightText, this.editor.nativeElement);

    if (!cursorPositionInLine.isOnLastLine) {
      return;
    }

    const focusContext: IFocusContext = {
      initiator: FOCUS_INITIATOR,
      details: {
        bottomKey: true,
        caretLeftCoordinate: null
      }
    };

    this.wallUiApi.mode.edit.focusOnNextTextBrick(this.id, focusContext);

    // means that this function will handle the key event, so prose mirror
    // will call preventDefault internally
    return true;
  }

  ngOnDestroy() {
    // destroy all component subscriptions
    this.destroyed$.next();
  }

  // HELPFUL FUNCTIONS

  private addEmptyTextBrickBefore() {
    const newTextState = {
      text: '',
      tabs: this.state.tabs
    };

    this.wallModel.api.core2
      .addBrickBeforeBrickId(this.id, 'text2', newTextState);

    // scroll browser view to element
    this.editor.nativeElement.scrollIntoView({
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
      tabs: this.state.tabs
    };

    const addedBrick = this.wallModel.api.core2
      .addBrickAfterBrickId(this.id, 'text2', newTextState);

    // wait one tick for component rendering
    setTimeout(() => {
      this.wallUiApi.mode.edit.focusOnBrickId(addedBrick.id);
    });
  }

  private splitBrickForTwoPart(left: string, right: string) {
    this.addBrickAfter(right);
    this.updateText(left);
  }

  private updateText(text) {
    if (text === this.state.text) {
      throw new Error(`Trying to save the same text: ${text}`);
    }

    this.textChange$.next(text);
  }
}

