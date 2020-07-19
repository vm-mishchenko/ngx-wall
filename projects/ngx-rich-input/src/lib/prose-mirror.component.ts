import {Component, ElementRef, ViewChild} from '@angular/core';

import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {DOMParser, DOMSerializer, Schema} from 'prosemirror-model';

const nodes = {
  doc: {
    // may contains 0 or multiple text nodes
    content: 'text*'
  },
  text: {
    inline: true
  }
};
const marks = {
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
  b: {
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
      return ['strong', 0];
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
  selector: 'prose-mirror',
  templateUrl: `./prose-mirror.component.html`,
  styles: [`
      #container {
          padding: 5px;
          border: 1px solid silver;
      }

      .property {
          margin-bottom: 5px;
      }
  `]
})
export class ProseMirrorComponent {
  @ViewChild('container') container: ElementRef;

  view: any;
  stateProperties: any = {};


  ngOnInit() {
    const domNode = document.createElement('div');
    domNode.innerHTML = 'Simple <highlight>custom</highlight><b>bold</b> simple <a href="http://google.com">Link</a>'; // innerHTML;
    // domNode.innerHTML = 'Simple'; // innerHTML;
    // Read-only, represent document as hierarchy of nodes
    const doc = DOMParser.fromSchema(customSchema).parse(domNode);
    const state = EditorState.create({
      doc,
      schema: customSchema
    });

    this.view = new EditorView(this.container.nativeElement, {
      state,
      dispatchTransaction: (transaction) => {
        const newState = this.view.state.apply(transaction);

        this.view.updateState(newState);
        this.updateStateProperties();
      },
    });

    this.updateStateProperties();
  }

  updateStateProperties() {
    this.stateProperties = {
      representation: {
        text: this.getTextRepresentation(this.view.state.doc),
        html: this.getHTMLRepresentation(this.view.state.doc),
        contentJson: this.getContentJSON(this.view.state.doc)
      },
      selection: {
        isTextSelected: this.isTextSelected(this.view.state),
        isCursorBetweenNodes: this.isCursorBetweenNodes(this.view.state),
        isCursorAtTheStart: this.isCursorAtTheStart(this.view.state),
        isCursorAtTheEnd: this.isCursorAtTheEnd(this.view.state),
        selectedText: this.getSelectedText(this.view.state),
        selectedHTML: this.getSelectedHTML(this.view.state),
        rightText: this.getTextCursorToEnd(this.view.state),
        rightHTML: this.getHTMLCursorToEnd(this.view.state),
        leftText: this.getTextBeginningToCursor(this.view.state),
        leftHTML: this.getHTMLBeginningToCursor(this.view.state),
        text: this.getSelectionAsText(this.view.state),
        currentNode: this.getCurrentNode(this.view.state)
      }
    };
  }

  getContentJSON(doc) {
    return doc.content.content.map((childNode) => {
      const result = {
        name: childNode.type.name,
        text: childNode.text,
      };

      if (childNode.marks.length) {
        result['marks'] = childNode.marks.map((mark) => {
          const markResult = {
            name: mark.type.name,
          };

          if (Object.keys(mark.attrs).length) {
            markResult['attrs'] = mark.attrs;
          }

          return markResult;
        });
      }

      return result;
    });
  }

  getTextRepresentation(doc) {
    return doc.textContent;
  }

  getHTMLRepresentation(doc) {
    const documentFragment = serializer.serializeFragment(doc.content);
    const div = document.createElement('DIV');

    div.append(documentFragment);

    return div.innerHTML;
  }

  getSelectionAsText(state) {
    const content = state.selection.content();

    // console.log(content.openStart);
    // console.log(content.openEnd);
  }

  getTextBeginningToCursor(state) {
    const $from = state.selection.$from;

    // Create a copy of this node with only the content between the given positions.
    const doc = $from.parent.cut(0, $from.pos);

    return this.getTextRepresentation(doc);
  }

  getHTMLBeginningToCursor(state) {
    const $from = state.selection.$from;

    // Create a copy of this node with only the content between the given positions.
    const doc = $from.parent.cut(0, $from.pos);

    return this.getHTMLRepresentation(doc);
  }

  getTextCursorToEnd(state) {
    const $from = state.selection.$from;

    // Create a copy of this node with only the content between the given positions.
    const doc = $from.parent.cut($from.pos);

    return this.getTextRepresentation(doc);
  }

  getHTMLCursorToEnd(state) {
    const $from = state.selection.$from;

    // Create a copy of this node with only the content between the given positions.
    const doc = $from.parent.cut($from.pos);

    return this.getHTMLRepresentation(doc);
  }

  getSelectedText(state) {
    const $to = state.selection.$to;
    const $from = state.selection.$from;

    // Create a copy of this node with only the content between the given positions.
    const doc = $from.parent.cut($from.pos, $to.pos);

    return this.getTextRepresentation(doc);
  }

  getSelectedHTML(state) {
    const $to = state.selection.$to;
    const $from = state.selection.$from;

    // Create a copy of this node with only the content between the given positions.
    const doc = $from.parent.cut($from.pos, $to.pos);

    return this.getHTMLRepresentation(doc);
  }

  isTextSelected(state) {
    // if $cursor = null text is selected
    return !Boolean(state.selection.$cursor);
  }

  getCurrentNode(state) {
    // For all these cases Node is not determined
    // 1. <node>|<node>
    // 2. |<node>...
    // 3. ...<node>|

    if (this.isTextSelected(state) || this.isCursorBetweenNodes(state)) {
      return;
    }

    const $cursor = state.selection.$cursor;

    return $cursor.parent.child($cursor.index());
  }

  isCursorBetweenNodes(state) {
    if (this.isTextSelected(state)) {
      return;
    }

    return state.selection.$cursor.textOffset === 0;
  }

  isCursorAtTheStart(state) {
    if (this.isTextSelected(state)) {
      return;
    }

    return state.selection.$cursor.pos === 0;
  }

  isCursorAtTheEnd(state) {
    if (this.isTextSelected(state)) {
      return;
    }

    return state.selection.$cursor.pos === state.selection.$cursor.parent.content.size;
  }

  // experimental functions
  appendTextAtTheBeginning() {
    console.log(`appendTextAtTheBeginning`);
  }
}

