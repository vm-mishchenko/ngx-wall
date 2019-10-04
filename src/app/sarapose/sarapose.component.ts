import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {baseKeymap} from 'prosemirror-commands';
import {keymap} from 'prosemirror-keymap';
import {DOMParser, DOMSerializer, Fragment, Schema} from 'prosemirror-model';

import {marks, nodes} from 'prosemirror-schema-basic';
import {EditorState, TextSelection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';

/*
* 1. save/restore text
* 2. split text into two sub paragraph
*/

const customSchema = new Schema({
  nodes,
  marks: {
    ...marks,
    highlight: {
      // parseDOM: [{tag: "i"}, {tag: "em"}, {style: "font-style=italic"}],
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
          background-color: yellow;
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
        const newState = this.view.state.apply(transaction);
        this.view.updateState(newState);

        // save current state
        const paragraph = this.view.state.doc.content.child(0);
        const paragraphNode = serializer.serializeNode(paragraph);
        localStorage.setItem('state', JSON.stringify({
          innerHTML: paragraphNode.innerHTML
        }));
        this.htmlRepresentation = paragraphNode.innerHTML;

        // experiments
        this.ui.rightHTMLString = this.getCursorRightHtml();
        this.ui.leftHTMLString = this.getCursorLeftHtml();
      }
    });
  }

  // QUERIES

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
}
