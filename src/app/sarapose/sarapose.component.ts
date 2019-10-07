import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {baseKeymap} from 'prosemirror-commands';
import {keymap} from 'prosemirror-keymap';
import {DOMParser, DOMSerializer, Fragment, Schema} from 'prosemirror-model';

import {marks, nodes} from 'prosemirror-schema-basic';
import {EditorState, TextSelection} from 'prosemirror-state';
import {ReplaceStep} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';

/**
 * Types of features in terms of Origin
 * 1. "/" symbol - show context modal with brick selection
 * 2. `test` - add 'code' mark to the specific text
 * 3. ~text~ - add 'highlight' mark to the specific text
 * 4. Select text using keyboard/mouse - show the context menu.
 * On web:
 *  - selection by keyboard:
 *    * show menu by "Alt+Enter" key combination
 *      ** convert to highlight
 *      ** convert to code
 *      ** convert to bold
 *      ** convert to italic
 *      ** add link
 *    * apply operation (e.g. mark as code, highlight) by specific keyboard hot-key
 *  - selection by mouse: show menu automatically after small timeout
 * On mobile: do nothing for now
 */

const customSchema = new Schema({
  nodes,
  marks: {
    ...marks,
    highlight: {
      parseDOM: [{tag: 'highlight'}],
      toDOM: function toDOM() {
        return ['highlight', 0];
      }
    }
  },
});

const serializer = DOMSerializer.fromSchema(customSchema);

@Component({
  templateUrl: './sarapose.component.html',
  // encapsulation: ViewEncapsulation.None,
  styles: [`
      ::ng-deep highlight {
          background-color: red;
      }

      ::ng-deep .ProseMirror p {
          padding: 10px;
          font-size: 18px;
      }

      pre {
          background: #e1e1e1;
      }
  `]
})
export class SaraposeComponent implements OnInit {
  @ViewChild('container') container: ElementRef;

  ui: any = {};

  state: any;
  view: any;

  htmlRepresentation: any;

  constructor() {
  }

  ngOnInit() {
    let previousState = JSON.parse(localStorage.getItem('state'));

    if (!previousState) {
      previousState = {
        innerHTML: ''
      };
    }

    this.htmlRepresentation = previousState.innerHTML;

    const domNode = document.createElement('div');
    domNode.innerHTML = previousState.innerHTML;
    const doc = DOMParser.fromSchema(customSchema).parse(domNode);

    this.state = EditorState.create({
      doc,
      schema: customSchema,
      plugins: [
        keymap({
          'Enter': (state, dispatch, view) => {
            const rightHTMLBeforeCut = this.getCursorRightHtml();

            const tr = view.state.tr;
            const $from = view.state.selection.$from;

            const absoluteCursorPosition = $from.pos;
            // The (absolute) position at the end of the node at the given level.
            const absolutePositionAtTheEndOfTheNode = $from.end();

            tr.delete(absoluteCursorPosition, absolutePositionAtTheEndOfTheNode);

            this.view.dispatch(tr);

            return true;
          }
        }),
        keymap(baseKeymap)
      ]
    });

    this.view = new EditorView(this.container.nativeElement, {
      state: this.state,
      dispatchTransaction: (transaction) => {
        // highlight node with pattern: this's nice

        if (this.highlight(transaction)) {
          return;
        }

        const newState = this.view.state.apply(transaction);
        this.view.updateState(newState);

        // save current state
        const paragraph = this.view.state.doc.content.child(0);
        const paragraphNode = serializer.serializeNode(paragraph);
        localStorage.setItem('state', JSON.stringify({
          innerHTML: paragraphNode.innerHTML
        }));
        this.htmlRepresentation = paragraphNode.innerHTML;

        // query params
        this.ui.rightHTMLString = this.getCursorRightHtml();
        this.ui.leftHTMLString = this.getCursorLeftHtml();
      }
    });
  }

  // QUERIES

  isLastTextNode() {
    return !Boolean(this.view.state.selection.$from.nodeAfter);
  }

  getCursorRightHtml() {
    const $from = this.view.state.selection.$from;
    const currentParent = $from.parent;

    const rightNodes = [];
    currentParent.nodesBetween($from.parentOffset, currentParent.content.size, (node, pos, parent, nodeInBetweenIndex) => {
      if (nodeInBetweenIndex === $from.index()) {
        const rightPartOfTheNode = node.cut($from.textOffset, node.nodeSize);

        rightNodes.push(rightPartOfTheNode);
      } else {
        rightNodes.push(node);
      }

      return true;
    });

    const rightFragment = Fragment.from(rightNodes);
    const htmlString = this.fragmentToHTMLString(rightFragment);

    return htmlString;
  }

  getCursorLeftHtml() {
    const $from = this.view.state.selection.$from;
    const currentParent = $from.parent;

    const nodes = [];
    currentParent.nodesBetween(0, $from.parentOffset, (node, pos, parent, nodeInBetweenIndex) => {
      if (nodeInBetweenIndex === $from.index()) {
        const rightPartOfTheNode = node.cut(0, $from.textOffset);

        nodes.push(rightPartOfTheNode);
      } else {
        nodes.push(node);
      }

      return true;
    });

    const fragment = Fragment.from(nodes);
    const htmlString = this.fragmentToHTMLString(fragment);

    return htmlString;
  }

  // COMMANDS

  highlight(transaction) {
    if (!this.isTransactionAddSymbol(transaction, '`')) {
      return false;
    }

    const leftNode = this.view.state.selection.$from.nodeBefore;

    if (!leftNode || leftNode.marks.length || !leftNode.nodeSize) {
      return;
    }

    const leftOpenCharacterIndex = leftNode.text.indexOf('`');

    if (leftOpenCharacterIndex === -1) {
      return false;
    }

    const cursorPosition = this.view.state.selection.$from.pos;

    const startPos = cursorPosition - leftNode.nodeSize + leftOpenCharacterIndex;

    if (startPos + 1 === cursorPosition) {
      return false;
    }

    // all conditions are valid - highlight the text
    const tr = this.view.state.tr;
    tr.delete(startPos, startPos + 1);

    const highlightMark = this.view.state.doc.type.schema.marks.highlight.create();
    tr.addMark(startPos, tr.selection.$cursor.pos, highlightMark);

    tr.insert(tr.selection.$cursor.pos, this.view.state.config.schema.text(' '));

    this.view.dispatch(tr);

    return true;
  }

  manuallyChangeState() {
    const tr = this.view.state.tr;
    tr.insertText('Manually inserted text. ');

    const newState = this.view.state.apply(tr);
    this.view.updateState(newState);
  }

  setFocus() {
    let tr = this.view.state.tr;

    const textSelection = TextSelection.create(tr.doc, 10, 16);

    tr = tr.setSelection(textSelection).scrollIntoView();

    this.view.dispatch(tr);
    this.view.focus();
  }

  addEmMarkToSelectedText() {
    if (this.view.state.selection.empty) {
      console.log(`Selection is empty`);
      return;
    }

    const tr = this.view.state.tr;

    // automatically mark lower and upper bound of the selection
    const {from, to} = this.view.state.selection;

    tr.addMark(from, to, this.view.state.doc.type.schema.marks.em.create());
    this.view.dispatch(tr);
  }

  addStrongMarkToSelectedText() {
    if (this.view.state.selection.empty) {
      console.log(`Selection is empty`);
      return;
    }

    const tr = this.view.state.tr;

    // automatically mark lower and upper bound of the selection
    const {from, to} = this.view.state.selection;

    tr.addMark(from, to, this.view.state.doc.type.schema.marks.strong.create());
    this.view.dispatch(tr);
  }

  removeStrongMarkToSelectedText() {
    if (this.view.state.selection.empty) {
      console.log(`Selection is empty`);
      return;
    }

    const tr = this.view.state.tr;

    // automatically mark lower and upper bound of the selection
    const {from, to} = this.view.state.selection;

    tr.removeMark(from, to, this.view.state.doc.type.schema.marks.strong);
    this.view.dispatch(tr);
  }

  removeAllMarksFromSelectedText() {
    if (this.view.state.selection.empty) {
      console.log(`Selection is empty`);
      return;
    }

    const tr = this.view.state.tr;

    // automatically mark lower and upper bound of the selection
    const {from, to} = this.view.state.selection;

    tr.removeMark(from, to);
    this.view.dispatch(tr);
  }

  convertToLinkSelectedText() {
    if (this.view.state.selection.empty) {
      console.log(`Selection is empty`);
      return;
    }

    const tr = this.view.state.tr;

    // automatically mark lower and upper bound of the selection
    const {from, to} = this.view.state.selection;

    tr.addMark(from, to, this.view.state.doc.type.schema.marks.link.create({
      href: 'http://google.com',
      title: 'Some title'
    }));

    this.view.dispatch(tr);
  }

  convertToHighlight(startPos: number, endPos: number) {
    const tr = this.view.state.tr;
    const highlightMark = this.view.state.doc.type.schema.marks.highlight.create();

    tr.addMark(startPos, endPos, highlightMark);

    this.view.dispatch(tr);
  }

  addHighlightMarkToSelectedText() {
    if (this.view.state.selection.empty) {
      console.log(`Selection is empty`);
      return;
    }

    const tr = this.view.state.tr;

    // automatically mark lower and upper bound of the selection
    const {from, to} = this.view.state.selection;

    tr.addMark(from, to, this.view.state.doc.type.schema.marks.highlight.create());
    this.view.dispatch(tr);
  }

  // helpers
  private fragmentToHTMLString(fragment: Fragment): string {
    const documentFragment = serializer.serializeFragment(fragment);
    const wrap = document.createElement('DIV');
    wrap.appendChild(documentFragment);
    return wrap.innerHTML;
  }

  private isTransactionAddSymbol(transaction, symbol): boolean {
    if (transaction.steps.length !== 1) {
      return false;
    }

    const step = transaction.steps[0];

    if (!(step instanceof ReplaceStep)) {
      return false;
    }

    if (step.slice.content.childCount !== 1) {
      return false;
    }

    const {text} = step.slice.content.firstChild;

    if (text[text.length - 1] !== symbol) {
      return false;
    }

    return true;
  }

  private isTransactionFocusInsideEndOfMark(transaction, mark): boolean {
    if (!this.isFocusTransaction(transaction)) {
      return false;
    }

    const nodeAfter = transaction.curSelection.$head.nodeAfter;
    const nodeBefore = transaction.curSelection.$head.nodeBefore;

    if (!nodeBefore) {
      return false;
    }

    return mark.isInSet(nodeBefore.marks) && (!nodeAfter || !mark.isInSet(nodeAfter.marks));
  }

  private isFocusTransaction(transaction) {
    return !Boolean(transaction.docChanged && transaction.steps.length);
  }
}
