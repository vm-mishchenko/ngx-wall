import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {baseKeymap} from 'prosemirror-commands';
import {keymap} from 'prosemirror-keymap';
import {DOMParser, DOMSerializer, Fragment, Schema} from 'prosemirror-model';

import {marks, nodes} from 'prosemirror-schema-basic';
import {EditorState, TextSelection} from 'prosemirror-state';
import {canSplit} from 'prosemirror-transform';
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

@Component({
  templateUrl: './sarapose.component.html',
  // encapsulation: ViewEncapsulation.None,
  styles: [`
      ::ng-deep highlight {
          background-color: yellow;
      }

      ::ng-deep .ProseMirror p {
          padding: 10px;
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
            const ref = state.selection;
            const $from = ref.$from;
            const $to = ref.$to;

            const tr = state.tr;
            // tr.split($from.pos);

            // dispatch(tr.scrollIntoView());

            // return true;
          }
        }),
        keymap({
          'Enter': (state, dispatch, view) => {
            const ref = state.selection;
            const $from = ref.$from;
            const $to = ref.$to;

            if (dispatch) {
              // check whether cursor stay at the end?
              // $to.parentOffset - left cursor position, marks does not count.
              const atEnd = $to.parentOffset === $to.parent.content.size;

              // start transaction
              const tr = state.tr;

              // delete any selected text
              if (state.selection instanceof TextSelection) {
                tr.deleteSelection();
              }

              // take parent
              // const deflt = $from.parent;
              let defaultType;

              if ($from.depth === 0) {
                defaultType = null;
              } else {
                // from doc: The index pointing after this position into the ancestor at the given level.
                const indexAfter = $from.indexAfter(-1);

                // take the node which -1 depth from current
                const ancestorNodeOneStepBehind = $from.node(-1);


                // from doc: Instances of this class represent a match state of a node type's content expression,
                // and can be used to find out whether further content matches here, and whether a given position is a valid end of the node.
                const contentMatch = ancestorNodeOneStepBehind.contentMatchAt(indexAfter);

                defaultType = contentMatch.defaultType;
              }

              let types;
              if (atEnd && defaultType) {
                types = [{type: defaultType}];
              } else {
                types = null;
              }

              // doc, pos, depth, typesAfter
              let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);

              if (!types && !can && canSplit(tr.doc, tr.mapping.map($from.pos), 1, defaultType && [{type: defaultType}])) {
                types = [{type: defaultType}];
                can = true;
              }

              if (can) {
                console.log(`split`);
                tr.split(tr.mapping.map($from.pos), 1, types);
                if (!atEnd && !$from.parentOffset && $from.parent.type !== defaultType &&
                  $from.node(-1).canReplace($from.index(-1), $from.indexAfter(-1), Fragment.from(defaultType.create(), $from.parent))) {
                  tr.setNodeMarkup(tr.mapping.map($from.before()), defaultType);
                }
              }
              dispatch(tr.scrollIntoView());
            }

            // meaning that it handle the key pressing
            return true;
          }
        }),
        keymap(baseKeymap)
      ]
    });

    this.view = new EditorView(this.container.nativeElement, {
      state: this.state,
      dispatchTransaction: (transaction) => {

        /*currentParent.descendants((node, pos, parent) => {
            console.log(pos);
            console.log(node);
            return true;
          });*/

        const newState = this.view.state.apply(transaction);
        this.view.updateState(newState);

        // experiments
        const {from, to} = this.view.state.selection;
        const pos$ = this.view.state.selection.$from;
        const before = pos$.node(pos$.depth).copy(Fragment.empty);
        const currentParent = pos$.parent;

        const currentNode = pos$.parent.maybeChild(pos$.index());

        if (currentNode) {
          const currentNodeClone = currentNode.copy(Fragment.empty);
          let leftCurrentNodeClone;

          if (pos$.textOffset === 0) {
            this.ui.activeTextNodeLeftPart = '';
          } else {
            if (currentNodeClone.nodeSize === pos$.textOffset) {
              leftCurrentNodeClone = currentNodeClone;
            } else {
              leftCurrentNodeClone = currentNodeClone.cut(0, pos$.textOffset);
            }

            this.ui.activeTextNodeLeftPart = leftCurrentNodeClone.text;
          }
        }

        /*const result = Fragment.empty;
        currentParent.nodesBetween(0, pos$.parentOffset, (node, pos, parent) => {
          console.log(pos);
          console.log(node);
          return true;
        });*/

        // save current state
        const serializer = DOMSerializer.fromSchema(customSchema);
        const paragraph = this.view.state.doc.content.child(0);
        const paragraphNode = serializer.serializeNode(paragraph);
        localStorage.setItem('state', JSON.stringify({
          innerHTML: paragraphNode.innerHTML
        }));
        this.htmlRepresentation = paragraphNode.innerHTML;
      }
    });
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
}
