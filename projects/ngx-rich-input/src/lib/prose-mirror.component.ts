import {Component, ElementRef, ViewChild} from '@angular/core';

import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {DOMParser, Schema} from 'prosemirror-model';

/*
*
* Model - data structure
* State - editor state (selection, transaction ...)
* View
* Transform
*
*
*
* */

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
  docContentInfo = {};

  ngOnInit() {
    console.log(`ngOnInit`);

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

    const domNode = document.createElement('div');
    domNode.innerHTML = '<p>Simple <b>bold</b> <em>inlined <b>bold</b></em> <a href="http://google.com">Link</a></p>'; // innerHTML;
    // Read-only, represent document as hierarchy of nodes
    const doc = DOMParser.fromSchema(customSchema).parse(domNode);
    this.updateDocContentInfo(doc);

    const state = EditorState.create({
      doc,
      schema: customSchema
    });

    this.view = new EditorView(this.container.nativeElement, {
      state,
      dispatchTransaction: (transaction) => {
        console.log('Document size went from', transaction.before.content.size, 'to', transaction.doc.content.size);

        const newState = this.view.state.apply(transaction);

        console.log(newState);

        this.updateDocContentInfo(newState.doc);

        this.view.updateState(newState);
      },
    });
  }

  updateDocContentInfo(doc) {
    this.docContentInfo = doc.content.content.map((childNode) => {
      const result = {
        name: childNode.type.name,
        text: childNode.text,
      };

      if (childNode.marks.length) {
        result['marks'] = childNode.marks.map((mark) => {
          const markResult = {
            name: mark.type.name,
          };

          if (mark.attrs.length) {
            markResult['attrs'] = mark.attrs;
          }

          return markResult;
        });
      }

      return result;
    });
  }

  // experimental functions
  appendTextAtTheBeginning() {
    console.log(`appendTextAtTheBeginning`);
  }
}

