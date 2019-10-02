import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {baseKeymap} from 'prosemirror-commands';
import {keymap} from 'prosemirror-keymap';
import {DOMParser, DOMSerializer, Schema} from 'prosemirror-model';

import {marks, nodes} from 'prosemirror-schema-basic';
import {EditorState, TextSelection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {foo} from 'saropose';

/*
* 1. save/restore text
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
  `]
})
export class SaraposeComponent implements OnInit {
  @ViewChild('container') container: ElementRef;

  state: any;
  view: any;

  htmlRepresentation: any;

  constructor() {
    console.log(foo);

    console.log(this.container);
  }

  ngOnInit() {
    const previousState = JSON.parse(localStorage.getItem('state'));

    if (previousState) {
      this.htmlRepresentation = previousState.innerHTML;

      const domNode = document.createElement('div');
      domNode.innerHTML = previousState.innerHTML;
      const doc = DOMParser.fromSchema(customSchema).parse(domNode);

      this.state = EditorState.create({
        doc,
        schema: customSchema,
        plugins: [
          keymap(baseKeymap)
        ]
      });
    } else {
      this.state = EditorState.create({
        schema: customSchema,
        plugins: [
          keymap(baseKeymap)
        ]
      });
    }

    this.view = new EditorView(this.container.nativeElement, {
      state: this.state,
      dispatchTransaction: (transaction) => {
        const newState = this.view.state.apply(transaction);
        this.view.updateState(newState);

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
