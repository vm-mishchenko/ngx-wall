import {Component, ComponentFactoryResolver, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';

import {toggleMark} from 'prosemirror-commands';
import {EditorState, Plugin, PluginKey, Selection, TextSelection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {DOMParser, DOMSerializer, Schema} from 'prosemirror-model';
import {ReplaceStep} from 'prosemirror-transform';
import {keymap} from 'prosemirror-keymap';
import {STICKY_MODAL_DATA, StickyModalRef, StickyModalService, StickyPositionStrategy} from 'ngx-sticky-modal';
import {BehaviorSubject} from 'rxjs';
import {FormBuilder, Validators} from '@angular/forms';
import {FormGroup} from '@angular/forms/src/model';
import {linkSchema} from './prose-components/link';
import {
  findNode,
  isTextSelected,
  doesNodeHaveMarkType,
  getTextFromAndTo,
  getTextBeforeResolvedPos,
  isResPositionBetweenNodes,
  setCursorAtPosition,
  getDocTextRepresentation,
  getSelectedText,
  isCursorBetweenNodes,
  getCurrentNode,
  getTextAfterResolvedPos,
  getHTMLAfterResolvedPos,
  getHTMLBeforeResolvedPos, setCursorAtStart, setCursorAtEnd
} from './prose-components/commands';
import {symbolDetectorPluginFactory} from './plugins/prose-mirror-symbol-detector-plugin.factory';
import {suggestionPluginFactory} from './plugins/prose-mirror-suggestion-lugin.factory';

const debug = true;

/**
 *
 * Node
 *  - descendants
 *  - forEach
 *  - textBetween
 *  - rangeHasMark
 *
 * Fragment
 *  does not expose `content` variable
 *
 *  - descendants
 *  - forEach
 *  - rangeHasMark
 *
 * Transaction
 *  - replaceWith - take position and Node|Fragment
 *
 * Cursor
 *  - marks() - get list of marks for node where cursor points
 *
 * Mark
 *  - attrs
 *
 *  Selection
 *   - content - Slice of selected content
 */

@Component({
  template: `
    <form [formGroup]="linkMenuForm" (keydown.enter)="onSubmit()">
      <p>
        <input formControlName="title" placeholder="title" type="text">
      </p>

      <p>
        <input formControlName="href" #href placeholder="href" type="text" required>
      </p>

      <button type="submit" mat-button [disabled]="!linkMenuForm.valid">
        Apply
      </button>
    </form>
  `,
  styles: [`
    :host {
      margin: 20px;
      background: aquamarine;
    }
  `]
})
export class LinkMenuComponent implements OnInit {
  @ViewChild('href') href: ElementRef;

  linkMenuForm: FormGroup;

  constructor(@Inject(STICKY_MODAL_DATA) public config: any,
              private ngxStickyModalRef: StickyModalRef,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.linkMenuForm = this.fb.group({
      title: [this.config.title || ''],
      href: [this.config.href || '', Validators.required]
    });

    this.href.nativeElement.focus();
  }

  onSubmit() {
    if (!this.linkMenuForm.valid) {
      return;
    }

    this.ngxStickyModalRef.close(this.linkMenuForm.value);
  }
}

function appendStarNode(view) {
  const type = view.state.doc.type.schema.nodes.star;
  const {$from} = view.state.selection;

  if (!$from.parent.canReplaceWith($from.index(), $from.index(), type)) {
    return false;
  }

  view.dispatch(view.state.tr.replaceSelectionWith(type.create()));
  return true;
}

function addHighlightMarkToSelectedText(view) {
  if (!isTextSelected(view.state.selection)) {
    console.warn('Text is not selected');
    return;
  }

  const tr = view.state.tr;
  const {from, to} = view.state.selection;
  const highlightMark = view.state.doc.type.schema.marks.highlight.create();

  tr.addMark(from, to, highlightMark);

  view.dispatch(tr);
}

@Component({
  template: `
    Text: {{config.text$ | async}}
  `,
  styles: [`
    :host {
      background: red;
    }
  `]
})
export class ContextMenuComponent implements OnInit {
  constructor(@Inject(STICKY_MODAL_DATA) public config: any) {
  }

  ngOnInit() {
    console.log(this.config.text$.getValue());
  }
}

const statePlugin = new Plugin({
  state: {
    init: () => {
      return 0;
    },

    // Apply the given transaction to this state field, producing a new field value.
    // Note that the newState argument is again a partially constructed state
    // does not yet contain the state from plugins coming after this one.
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
      return ['strong', 0];
    }
  },
  link: linkSchema
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

    ::ng-deep suggestion {
      padding: 2px;
      color: cornflowerblue;
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

  constructor(private ngxStickyModalService: StickyModalService,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
    const domNode = document.createElement('div');
    // domNode.innerHTML = 'Simple <highlight>custom</highlight><b>bold</b> simple <a href="http://google.com">Link</a>'; // innerHTML;
    // domNode.innerHTML = 'Simple <suggestion>custom</suggestion>Some'; // innerHTML;
    domNode.innerHTML = 'a <a title="First" href="https://first.com">First</a><a title="Second" href="https://second.com">Second</a><a href="https://third.com">Third</a>'; // innerHTML;
    // // Read-only, represent document as hierarchy of nodes
    const doc = DOMParser.fromSchema(customSchema).parse(domNode);

    let modalRef: StickyModalRef;
    const textChange = new BehaviorSubject('');
    const suggestionPlugin = suggestionPluginFactory({
      character: '/',

      onEnter: (context) => {
        modalRef = this.ngxStickyModalService.open({
          component: ContextMenuComponent,
          data: {
            text$: textChange,
          },
          positionStrategy: {
            name: StickyPositionStrategy.flexibleConnected,
            options: {
              relativeTo: this.container.nativeElement
            }
          },
          position: {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top'
          },
          overlayConfig: {
            hasBackdrop: true
          },
          componentFactoryResolver: this.componentFactoryResolver
        });

        modalRef.result.finally(() => {
          modalRef = null;
        });

        return false;
      },

      onChange: (context) => {
        console.log(`onChange`);

        if (!modalRef) {
          modalRef = this.ngxStickyModalService.open({
            component: ContextMenuComponent,
            data: {
              text$: textChange,
            },
            positionStrategy: {
              name: StickyPositionStrategy.flexibleConnected,
              options: {
                relativeTo: this.container.nativeElement
              }
            },
            position: {
              originX: 'start',
              originY: 'top',
              overlayX: 'start',
              overlayY: 'top'
            },
            overlayConfig: {
              hasBackdrop: true
            },
            componentFactoryResolver: this.componentFactoryResolver
          });

          modalRef.result.finally(() => {
            modalRef = null;
          });
        }

        textChange.next(context.match.text);
        return false;
      },

      onExit() {
        if (modalRef) {
          modalRef.dismiss();
          modalRef = null;
        }

        return false;
      },

      onFocusedWithoutCursorChange: (context) => {
        console.log(`onFocusedWithoutCursorChange`);

        if (!modalRef) {
          modalRef = this.ngxStickyModalService.open({
            component: ContextMenuComponent,
            data: {
              text$: textChange,
            },
            positionStrategy: {
              name: StickyPositionStrategy.flexibleConnected,
              options: {
                relativeTo: this.container.nativeElement
              }
            },
            position: {
              originX: 'start',
              originY: 'top',
              overlayX: 'start',
              overlayY: 'top'
            },
            overlayConfig: {
              hasBackdrop: true
            },
            componentFactoryResolver: this.componentFactoryResolver
          });

          modalRef.result.finally(() => {
            modalRef = null;
          });
        }

        textChange.next(context.match.text);
        return false;
      },

      // called only when plugin is active
      onKeyDown(context) {
        if (context.event.code === 'Enter') {
          console.log(`Enter! Convert to the Star!`);

          // suggestionPlugin.spec.replaceWithText(context.view, 'DONE');
          suggestionPlugin.spec.api.replaceWithNode(context.view, context.view.state.doc.type.schema.nodes.star.create());
          return true;
        }

        if (context.event.code === 'ArrowUp') {
          console.log(`ArrowUp! Prevent while suggestion active!`);
          return true;
        }

        if (context.event.code === 'ArrowDown') {
          console.log(`ArrowDown! Prevent while suggestion active!`);
          return true;
        }
      }
    });
    const iconSuggestionPlugin = suggestionPluginFactory({
      character: ':',

      onEnter: (context) => {
        console.log(`ENTER`);

        return false;
      },

      onChange: (context) => {
        console.log(`ONCHANGE`);
        return false;
      },

      onExit() {
        console.log(`ONEXIT`);

        return false;
      },

      onFocusedWithoutCursorChange: (context) => {
        console.log(`onFocusedWithoutCursorChange`);
        return false;
      },

      // called only when plugin is active
      onKeyDown(context) {
        console.log(`ONKEYDOWN`);

        return false;
      }
    });

    const strongSymbolDetectorPlugin = symbolDetectorPluginFactory({
      characters: '**',
      appendTransaction({newState, match}) {
        // the order of steps are important here!
        return newState.tr
          .addMark(
            match.fromTriggersPos,
            match.toTriggersPos,
            newState.doc.type.schema.marks.strong.create()
          )
          // at first remove last character, so the next cursor is not screw up
          // if at first remove left characters then we need to "map" cursor position for the next transaction step
          .replaceWith(match.toPos, match.toPos + 2, '')
          .replaceWith(match.fromTriggersPos, match.fromTriggersPos + 2, '')
          .setStoredMarks([]);
      }
    });

    const italicSymbolDetectorPlugin = symbolDetectorPluginFactory({
      characters: '*',
      appendTransaction({newState, match}) {
        // fromTriggersPos,
        // fromPos,
        // toTriggersPos
        // toPos

        // if fromTriggersPos in the middle of the text
        if (match.fromTriggersPos > 0) {
          const previousSymbol = newState.doc.textBetween(match.fromTriggersPos - 1, match.fromTriggersPos);

          // case: **text* - text should not be converted into `italic` in such case
          if (previousSymbol === '*') {
            console.log(`Ignore: previous symbol is *`);
            return false;
          }
        }

        // the order of steps are important here!
        return newState.tr
          .addMark(
            match.fromTriggersPos,
            match.toTriggersPos,
            newState.doc.type.schema.marks.em.create()
          )
          // at first remove last character, so the next cursor is not screw up
          // if at first remove left characters then we need to "map" cursor position for the next transaction step
          .replaceWith(match.toPos, match.toPos + 1, '')
          .replaceWith(match.fromTriggersPos, match.fromTriggersPos + 1, '')
          // make sure next character does not contains any style
          .setStoredMarks([]);
      }
    });

    const highlightSymbolDetectorPlugin = symbolDetectorPluginFactory({
      characters: '~',
      appendTransaction({newState, match}) {
        // fromTriggersPos,
        // fromPos,
        // toTriggersPos
        // toPos

        // the order of steps are important here!
        return newState.tr
          .addMark(
            match.fromTriggersPos,
            match.toTriggersPos,
            newState.doc.type.schema.marks.highlight.create()
          )
          // at first remove last character, so the next cursor is not screw up
          // if at first remove left characters then we need to "map" cursor position for the next transaction step
          .replaceWith(match.toPos, match.toPos + 1, '')
          .replaceWith(match.fromTriggersPos, match.fromTriggersPos + 1, '')
          // make sure next character does not contains any style
          .setStoredMarks([]);
      }
    });

    const keymapPlugin = keymap({
      'Mod-b': toggleMark(customSchema.marks.strong),
      'Mod-B': toggleMark(customSchema.marks.strong),
      'Mod-i': toggleMark(customSchema.marks.em),
      'Mod-I': toggleMark(customSchema.marks.em),
      'Mod-u': toggleMark(customSchema.marks.highlight),
      'Mod-U': toggleMark(customSchema.marks.highlight),
      'Mod-k': modifyLinkMark,
      'Alt-Enter': activateLinkMark,
    });

    const componentFactoryResolver = this.componentFactoryResolver;
    const ngxStickyModalService = this.ngxStickyModalService;
    const container = this.container;

    function activateLinkMark(state, dispatch, view) {
      if (isTextSelected(state.selection)) {
        const nodeWithLinkMark = findNode(state.selection.content().content, (node) => {
          return doesNodeHaveMarkType(node, customSchema.marks.link);
        });

        if (nodeWithLinkMark) {
          const href = nodeWithLinkMark.node.marks.find((mark) => {
            return mark.type === customSchema.marks.link;
          }).attrs.href;
          window.open(href, '_blank');
        }
      } else {
        if (isCursorBetweenNodes(state.selection)) {
          const {nodeAfter, nodeBefore} = state.selection.$cursor;

          if (nodeAfter && nodeBefore) {
            const doesNodeAfterHaveLinkMark = doesNodeHaveMarkType(nodeAfter, customSchema.marks.link);
            const doesNodeBeforeHaveLinkMark = doesNodeHaveMarkType(nodeBefore, customSchema.marks.link);

            if (doesNodeAfterHaveLinkMark && doesNodeBeforeHaveLinkMark) {
              // ignore
            } else if (doesNodeAfterHaveLinkMark) {
              const href = nodeAfter.marks.find(mark => mark.type === customSchema.marks.link).attrs.href;
              window.open(href, '_blank');

            } else if (doesNodeBeforeHaveLinkMark) {
              const href = nodeBefore.marks.find(mark => mark.type === customSchema.marks.link).attrs.href;
              window.open(href, '_blank');
            }

            // only one `after` or `before` node exists
          } else {
            const existingNode = nodeAfter || nodeBefore;

            if (existingNode && doesNodeHaveMarkType(existingNode, customSchema.marks.link)) {
              const href = existingNode.marks.find((mark) => {
                return mark.type === customSchema.marks.link;
              }).attrs.href;
              window.open(href, '_blank');
            }
          }
        } else {
          const currentNode = state.selection.$cursor.parent.child(state.selection.$cursor.index());

          if (doesNodeHaveMarkType(currentNode, customSchema.marks.link)) {
            const href = currentNode.marks.find((mark) => {
              return mark.type === customSchema.marks.link;
            }).attrs.href;
            window.open(href, '_blank');
          }
        }
      }

      return true;
    }

    function modifyLinkMark(state, dispatch, view) {
      console.log(`modifyLinkMark`);
      let href;
      let title;
      let to;
      let from;

      // behavior similar to Google docs
      if (isTextSelected(state.selection)) {
        // basic assumption
        from = state.selection.from;
        to = state.selection.to;

        // if `from` points to inside the text node with `link` mark, then extend `from` to the beginning of that node
        if (!isResPositionBetweenNodes(state.selection.$from) &&
          doesNodeHaveMarkType(state.doc.child(state.selection.$from.index()), customSchema.marks.link)) {
          from = state.selection.from - state.selection.$from.textOffset;
        }

        // if `$to` is not between the two nodes, then expand to the end of current text node if it has link mark
        if (!isResPositionBetweenNodes(state.selection.$to) &&
          state.selection.$to.nodeAfter &&
          doesNodeHaveMarkType(state.doc.child(state.selection.$to.index()), customSchema.marks.link)) {
          to = state.selection.to + state.selection.$to.nodeAfter.nodeSize;
        }

        title = state.doc.textBetween(from, to);

        // if selection picks links, set the first `href` as pre-defined
        const nodeWithLinkMark = findNode(state.doc.slice(from, to).content, (node) => {
          return doesNodeHaveMarkType(node, customSchema.marks.link);
        });

        if (nodeWithLinkMark) {
          href = nodeWithLinkMark.node.marks.find((mark) => {
            return mark.type === customSchema.marks.link;
          }).attrs.href;
        }
      } else {
        if (isCursorBetweenNodes(state.selection)) {
          // edit node with link mark
          // if both `after` and `before` nodes has `link` mark - ignore both, append new mark
          const {nodeAfter, nodeBefore} = state.selection.$cursor;

          if (nodeAfter && nodeBefore) {
            const doesNodeAfterHaveLinkMark = doesNodeHaveMarkType(nodeAfter, customSchema.marks.link);
            const doesNodeBeforeHaveLinkMark = doesNodeHaveMarkType(nodeBefore, customSchema.marks.link);

            if (doesNodeAfterHaveLinkMark && doesNodeBeforeHaveLinkMark) {
              // ignore
            } else if (doesNodeAfterHaveLinkMark) {
              const linkMark = nodeAfter.marks.find(mark => mark.type === customSchema.marks.link);

              from = state.selection.$cursor.pos;
              to = state.selection.$cursor.pos + nodeAfter.nodeSize;
              href = linkMark.attrs.href;
              title = nodeAfter.textContent;

            } else if (doesNodeBeforeHaveLinkMark) {
              const linkMark = nodeBefore.marks.find(mark => mark.type === customSchema.marks.link);

              from = state.selection.$cursor.pos - nodeAfter.nodeSize;
              to = state.selection.$cursor.pos;
              href = linkMark.attrs.href;
              title = nodeBefore.textContent;
            }

            // only one `after` or `before` node exists
          } else {
            const existingNode = nodeAfter || nodeBefore;

            if (existingNode && doesNodeHaveMarkType(existingNode, customSchema.marks.link)) {
              const linkMark = existingNode.marks.find(mark => mark.type === customSchema.marks.link);

              href = linkMark.attrs.href;
              title = existingNode.textContent;
            }
          }

          // node in the middle of some text node
        } else {
          // check whether current node has `link` mark
          const currentNode = state.selection.$cursor.parent.child(state.selection.$cursor.index());

          if (doesNodeHaveMarkType(currentNode, customSchema.marks.link)) {
            const linkMark = currentNode.marks.find(mark => mark.type === customSchema.marks.link);

            href = linkMark.attrs.href;
            title = currentNode.textContent;

            // calculate node position
            to = state.selection.$cursor.pos + state.selection.$cursor.nodeAfter.nodeSize;
            from = state.selection.$cursor.pos - state.selection.$cursor.nodeBefore.nodeSize;
          }
        }
      }

      ngxStickyModalService.open({
        component: LinkMenuComponent,
        data: {
          href,
          title,
        },
        positionStrategy: {
          name: StickyPositionStrategy.flexibleConnected,
          options: {
            relativeTo: container.nativeElement
          }
        },
        position: {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        },
        overlayConfig: {
          hasBackdrop: false
        },
        componentFactoryResolver: componentFactoryResolver
      }).result
        .then((result) => {
          if (!result.title) {
            result.title = result.href;
          }

          // in case if there was selected text
          // or cursor points to already existing node with link mark
          if (to) {
            // there is a know problem - when the same link is split by several nodes
            // because they all have a different set of marks
            const link = customSchema.text(result.title, customSchema.marks.link.create(result));

            view.dispatch(
              // all other marks for that section will be lost, that's expected behavior
              view.state.tr
                .setSelection(TextSelection.create(state.doc, /* anchor= */to, /* head? */to))
                .replaceWith(from, to, link)
            );
          } else {
            const link = customSchema.text(result.title, customSchema.marks.link.create(result));

            view.dispatch(
              view.state.tr.insert(state.selection.$cursor.pos, link)
            );
          }

        }).catch(() => {
        // user decided to cancel operation, nothing I can do
      }).finally(() => {
        view.focus();
      });

      return true;
    }

    const state = EditorState.create({
      doc,
      schema: customSchema,
      plugins: [
        keymapPlugin,
        highlightSymbolDetectorPlugin,
        italicSymbolDetectorPlugin,
        strongSymbolDetectorPlugin,
        iconSuggestionPlugin,
        suggestionPlugin,
        // statePlugin,
        // filterTransactionPlugin,
        // keyHandlerPluginFactory('ControlLeft'),
        // tooltipPlugin
      ]
    });
    this.view = new EditorView(this.container.nativeElement, {
      state,
      dispatchTransaction: (transaction) => {
        if (transaction.docChanged) {
          debug && console.log(`doc was changed`);
        }

        if (transaction.selectionSet) {
          debug && console.log(`selection was explicitly updated by this transaction.`);
        }

        if (transaction.getMeta('pointer')) {
          debug && console.log(`Transaction caused by mouse or touch input`);
        }

        const newState = this.view.state.apply(transaction);

        // The updateState method is just a shorthand to updating the "state" prop.
        this.view.updateState(newState);

        debug && console.log(transaction);

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
        isTextSelected: isTextSelected(this.view.state.selection),
        isCursorBetweenNodes: isCursorBetweenNodes(this.view.state.selection),
        isCursorAtTheStart: this.isCursorAtTheStart(this.view.state),
        isCursorAtTheEnd: this.isCursorAtTheEnd(this.view.state),
        selectedText: getSelectedText(this.view.state),
        selectedHTML: this.getSelectedHTML(this.view.state),
        rightText: this.getTextCursorToEnd(this.view.state.selection),
        rightHTML: this.getHTMLCursorToEnd(this.view.state.selection),
        leftText: this.getTextBeginningToCursor(this.view.state.selection),
        leftHTML: this.getHTMLBeginningToCursor(this.view.state.selection),
        text: this.getSelectionAsText(this.view.state),
        currentNode: getCurrentNode(this.view.state.selection)
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
    return getDocTextRepresentation(doc);
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

  getHTMLBeginningToCursor(selection) {
    if (isTextSelected(selection)) {
      return;
    }

    return getHTMLBeforeResolvedPos(selection.$cursor, serializer);
  }

  getTextCursorToEnd(selection) {
    if (isTextSelected(selection)) {
      return;
    }

    return getTextAfterResolvedPos(selection.$cursor);
  }

  getHTMLCursorToEnd(selection) {
    if (isTextSelected(selection)) {
      return;
    }

    return getHTMLAfterResolvedPos(selection.$cursor, serializer);
  }

  getSelectedHTML(state) {
    const $to = state.selection.$to;
    const $from = state.selection.$from;

    // Create a copy of this node with only the content between the given positions.
    const doc = $from.parent.cut($from.pos, $to.pos);

    return this.getHTMLRepresentation(doc);
  }

  isCursorAtTheStart(state) {
    if (isTextSelected(state.selection)) {
      return;
    }

    return state.selection.$cursor.pos === 0;
  }

  isCursorAtTheEnd(state) {
    if (isTextSelected(state.selection)) {
      return;
    }

    return state.selection.$cursor.pos === state.selection.$cursor.parent.content.size;
  }

  getTextBeginningToCursor(selection) {
    if (isTextSelected(selection)) {
      return;
    }

    return getTextBeforeResolvedPos(selection.$cursor);
  }

  // experimental functions
  appendStarNode(view) {
    appendStarNode(view);
  }

  appendTextAtTheBeginning() {
    this.view.dispatch(
      this.view.state.tr.insertText('Manually inserted text. ')
    );
  }

  setCursorAtTheStart() {
    setCursorAtStart(this.view.state, this.view.dispatch);
  }

  setCursorAtTheEnd() {
    setCursorAtEnd(this.view.state, this.view.dispatch);
  }

  setCursorAtPosition(position: number) {
    setCursorAtPosition(this.view.state, position, this.view.dispatch);
  }

  addHighlightMarkToSelectedText(view) {
    addHighlightMarkToSelectedText(view);
  }
}
