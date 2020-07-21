import {Component, ElementRef, ViewChild} from '@angular/core';

import {EditorState, Plugin, Selection, TextSelection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {DOMParser, DOMSerializer, Schema} from 'prosemirror-model';

const statePlugin = new Plugin({
  state: {
    init: () => {
      return 0;
    },

    apply: (tr, value, oldState, newState) => {
      return 1;
    },

    // how I save the state of the plugin = state.toJSON({<arbitrary field name>:<plugin instance>})
    toJSON: () => {
      return {
        count: 0
      };
    }
  }
});

const filterTransactionPlugin = new Plugin({
  filterTransaction: (transaction, editorState): boolean => {
    // true - allows transaction
    return true;
  },

  // designed to be able to observe any state change and react to it, once
  appendTransaction(transactions, oldState, newState) {
    if (/*condition*/ false) {
      const newTransaction = newState.tr;

      return newTransaction
        .setMeta('originator', 'filterTransactionPlugin')
        .insertText('Inserted', 0, 10);
    }
  }
});

function keyHandlerPluginFactory(keyCode) {
  return new Plugin({
    props: {
      handleKeyDown: (editorView, event) => {
        if (event.code === keyCode) {
          console.log(`Intercept event with ${keyCode} pressed!`);
          return true;
        }

        // default implementation should handle that event
        return false;
      },
    },
  });
}

class SelectionSizeTooltip {
  tooltip: any;

  constructor(view) {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tooltip';
    view.dom.parentNode.appendChild(this.tooltip);

    this.update(view, null);
  }

  // called on each state update
  update(view, prevState) {
    const state = view.state;
    // Don't do anything if the document/selection didn't change
    if (prevState && prevState.doc.eq(state.doc) &&
      prevState.selection.eq(state.selection)) {
      return;
    }

    // Hide the tooltip if the selection is empty
    if (state.selection.empty) {
      this.tooltip.style.display = 'none';
      return;
    }

    // Otherwise, reposition it and update its content
    this.tooltip.style.display = '';
    const {from, to} = state.selection;
    // These are in screen coordinates
    const start = view.coordsAtPos(from), end = view.coordsAtPos(to);
    // The box in which the tooltip is positioned, to use as base
    const box = this.tooltip.offsetParent.getBoundingClientRect();
    // Find a center-ish x position from the selection endpoints (when
    // crossing lines, end may be more to the left)
    const left = Math.max((start.left + end.left) / 2, start.left + 3);
    this.tooltip.style.left = (left - box.left) + 'px';
    this.tooltip.style.bottom = (box.bottom - start.top) + 'px';
    this.tooltip.textContent = to - from;
  }

  destroy() {
    this.tooltip.remove();
  }
}

const tooltipPlugin = new Plugin({
  // allows to define object with the hooks whenever state will be updated
  view(editorView) {
    return new SelectionSizeTooltip(editorView);
  }
});

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
      schema: customSchema,
      plugins: [
        statePlugin,
        // filterTransactionPlugin,
        // keyHandlerPluginFactory('ControlLeft'),
        // tooltipPlugin
      ]
    });

    this.view = new EditorView(this.container.nativeElement, {
      state,
      dispatchTransaction: (transaction) => {
        if (transaction.docChanged) {
          console.log(`doc is changed`);
        }

        if (transaction.getMeta('pointer')) {
          console.log(`Transaction caused by mouse or touch input`);
        }

        const newState = this.view.state.apply(transaction);

        // The updateState method is just a shorthand to updating the "state" prop.
        this.view.updateState(newState);

        console.log(transaction);

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
    // another way to test it - if ($cursor = null) text is selected
    return !state.selection.empty;
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
    this.view.dispatch(
      this.view.state.tr.insertText('Manually inserted text. ')
    );
  }

  setCursorAtTheStart() {
    this.view.dispatch(
      this.view.state.tr.setSelection(Selection.atStart(this.view.state.doc))
    );
  }

  setCursorAtTheEnd() {
    this.view.dispatch(
      this.view.state.tr.setSelection(Selection.atEnd(this.view.state.doc))
    );
  }

  setCursorAtPosition(position: number) {
    this.view.dispatch(
      this.view.state.tr.setSelection(TextSelection.create(this.view.state.doc, /* anchor= */position, /* head? */position))
    );
  }
}

