import {getTextBeforeResolvedPos, isCursorBetweenNodes, isTextSelected} from '../prose-components/commands';
import {Plugin, PluginKey} from 'prosemirror-state';
import {ReplaceStep} from 'prosemirror-transform';

export function suggestionPluginFactory({
                                          character = '/',
                                          onFocusedWithoutCursorChange = (context) => {
                                            console.log(`onFocusedWithoutCursorChange handler`);

                                            return false;
                                          },
                                          onKeyDown = (context) => {
                                            console.log(`onKeyDown handler`);

                                            return false;
                                          },
                                          onChange = (context) => {
                                            console.log(`onChange with text: ${context.match.text}`);
                                            return false;
                                          },
                                          onExit = (context) => {
                                            console.log(`onExit`);

                                            return false;
                                          },
                                          onEnter = (context) => {
                                            console.log(`onEnter`);
                                            // need to show dialog

                                            return false;
                                          },
                                        }) {
  const pluginKey = new PluginKey('suggestions');

  return new Plugin({
    // todo: most probably it should not belong here
    // plugin just need to call hooks and pass all necessary data to it
    api: {
      replaceWithText(view, text) {
        const currentState = pluginKey.getState(view.state);

        if (!currentState.active) {
          throw new Error(`Ignore replaceWithText call: plugin is inactive`);
        }

        // find suggestion node position
        let suggestionNode = null;
        let suggestionPosition = null;

        view.state.doc.descendants((node, pos) => {
          if (node.marks.map(mark => mark.type).includes(view.state.doc.type.schema.marks.suggestion)) {
            suggestionNode = node;
            suggestionPosition = pos;

            // `false` to prevent traversal of its child nodes
            return false;
          }
        });

        view.dispatch(view.state.tr.insertText(text, suggestionPosition, suggestionPosition + suggestionNode.nodeSize));
      },

      replaceWithNode(view, newNode) {
        const currentState = pluginKey.getState(view.state);

        if (!currentState.active) {
          throw new Error(`Ignore replaceWithNode call: plugin is inactive`);
        }

        let suggestionNode = null;
        let suggestionPosition = null;

        view.state.doc.descendants((node, pos) => {
          if (node.marks.map(mark => mark.type).includes(view.state.doc.type.schema.marks.suggestion)) {
            suggestionNode = node;
            suggestionPosition = pos;

            // `false` to prevent traversal of its child nodes
            return false;
          }
        });

        view.dispatch(view.state.tr.replaceWith(suggestionPosition, suggestionPosition + suggestionNode.nodeSize, newNode));
      },
    },

    key: pluginKey,

    props: {
      // false = default behaviour
      handleKeyDown(view, event) {
        console.log('handleKeyDown');
        const escapeCode = ['Escape'];
        const {active} = this.getState(view.state);

        if (!active) {
          // default implementation should handle that event
          console.log(`handleKeyDown: Ignored`);
          return false;
        }

        // de-activate suggestion
        // event.code - ignore layout
        if (escapeCode.includes(event.code)) {
          const tr = view.state.tr.setMeta(this.key, {
            active: false,
            match: {}
          });

          view.dispatch(tr);

          // default implementation should handle that event
          return false;
        }

        return onKeyDown({view, event});
      },

      handleClick(view, pos, event) {
        const currentPluginState = this.getState(view.state);

        if (!currentPluginState.active) {
          console.log(`Ignore handleClick: plugin is not active`);
          return;
        }

        if (view.state.selection.$cursor.pos !== pos) {
          console.log(`Ignore handleClick: cursor position was changed, so there should be a new transaction that handle the change`);
          return;
        }

        return onFocusedWithoutCursorChange({view, match: currentPluginState.match});
      }
    },

    // called on each transaction
    // designed to somehow react on current Editor state (show/hide dialog, tooltip, etc...)
    view(editorView) {
      return {
        /**
         * For each transaction check, whether state is active which is sign to show the dialog
         * */
        update: (view, prevState) => {
          const prevValue = this.key.getState(prevState);
          const nextValue = this.key.getState(view.state);

          // See how the state changed
          const moved = prevValue.active && nextValue.active && prevValue.match.cursorPosition !== nextValue.match.cursorPosition;
          const started = !prevValue.active && nextValue.active;
          const stopped = prevValue.active && !nextValue.active;
          const changed = !started && !stopped && prevValue.match.text !== nextValue.match.text;

          // Trigger the hooks when necessary
          if (stopped) {
            removeAllSuggestionMarks(view);

            onExit({view, match: prevValue.match});
          }
          if (changed) {
            onChange({view, match: nextValue.match});
          }
          if (started) {
            addSuggestionMarkToPreviousCharacter(view);

            onEnter({view, match: nextValue.match});
          }
        },
      };
    },

    state: {
      init() {
        return {
          active: false,
          match: {}
        };
      },

      /**
       * Calculate new plugin state basic on the current transaction. Check whether it's suitable moment to show the dialog.
       * plugin "view" callback will be called next, which is actually responsible to show dialog or somehow else react to
       * the plugin state
       * */
      apply(tr, prevValue, oldState, newState) {
        const meta = tr.getMeta(this.key);
        if (meta) {
          return meta;
        }

        const {selection} = tr;

        if (isTextSelected(selection)) {
          console.log(`Ignore: text is selected`);
          return {active: false, match: {}};
        }

        if (prevValue.active === false) {
          if ((tr.getMeta('suggestion-stage') === 'exit')) {
            console.log(`Ignore: Exit phase`);
            return {active: false, match: {}};
          }

          if (!tr.docChanged) {
            // ignore if doc was not changed
            console.log(`Ignore: doc is not changed`);
            return {active: false, match: {}};
          }

          const text = getTextBeforeResolvedPos(tr.curSelection.$cursor);

          if (text.length === 0) {
            console.log(`Ignore: text is empty`);
            return {active: false, match: {}};
          }

          if (text[text.length - 1] !== character) {
            console.log(`Ignore: "${character}" character was no added`);
            return {active: false, match: {}};
          }

          if (text[text.length - 2] && text[text.length - 2] !== ' ') {
            console.log(`Ignore: there is symbol before "${character}" character.`);
            return {active: false, match: {}};
          }

          // check that current transaction actually added "{{character}}" symbol
          if (tr.steps.length !== 1) {
            console.log(`Ignore: Expect only one transaction step present`);
            return {active: false, match: {}};
          }

          if (!(tr.steps[0] instanceof ReplaceStep)) {
            console.log(`Ignore: Unexpected transaction step`);
            return {active: false, match: {}};
          }

          const replaceStepContent = tr.steps[0].slice.content.textBetween(0, tr.steps[0].slice.content.size);
          if (replaceStepContent !== character) {
            console.log(`Ignore: transaction step contains unexpected content:${replaceStepContent}`);
            return {active: false, match: {}};
          }

          // finally initialize plugin state
          return {
            active: true,
            match: {
              text: '',
              cursorPosition: tr.curSelection.$cursor.pos
            }
          };
        } else {
          // plugin is already active

          if (tr.getMeta('suggestion-stage') === 'enter') {
            console.log(`Ignore: Enter phase`);
            return prevValue;
          }

          // handle copy-paste case
          if (isCursorBetweenNodes(tr.curSelection)) {
            if (!tr.curSelection.$cursor.nodeBefore) {
              console.log(`Ignore: Extra strange behaviour.`);
              return {active: false, match: {}};
            }

            const markSuggestion = tr.curSelection.$cursor.nodeBefore.marks.find((mark) => {
              return mark.type === newState.doc.type.schema.marks.suggestion;
            });

            // node before does not have suggestion mark
            // it means that user type "{{character}}" and them copy-paste some text
            // that text is copied to the new text node, rather than into suggestion node
            // as result we need to abort suggestion process
            if (!markSuggestion) {
              console.log(`Ignore: node before cursor is not suggestion. Might happen during copy-paste functionality.`);
              return {active: false, match: {}};
            }
          }

          // check whether text after "{{character}}" does not have any spaces
          // if it has than abort suggestion
          const text = getTextBeforeResolvedPos(tr.curSelection.$cursor);
          // match all after "{{character}}" except space
          const regexp = new RegExp(`.*\\${character}([^ ]*)$`);
          const match = text.match(regexp);

          if (!match) {
            console.log(`Ignore: cannot find appropriate text in: ${text}`);
            return {active: false, match: {}};
          }

          return {
            active: true,
            match: {
              text: match[1],
              cursorPosition: tr.curSelection.$cursor.pos
            }
          };
        }
      }
    },

    // designed to be able to observe any state change and react to it, once
    appendTransaction(transactions, oldState, newState) {
      if (transactions.length !== 1) {
        return;
      }

      const transaction = transactions[0];

      if (transaction.getMeta('suggestion-stage') !== 'exit') {
        return false;
      }

      return newState.tr.setStoredMarks([]);
    }
  });
}


function removeAllSuggestionMarks(view) {
  console.log(`removeAllSuggestionMarks`);
  const tr = view.state.tr;

  tr.removeMark(0, view.state.doc.content.size, view.state.doc.type.schema.marks.suggestion)
    .setMeta('suggestion-stage', 'exit');

  view.dispatch(tr);
}

function addSuggestionMarkToPreviousCharacter(view) {
  if (isTextSelected(view.state.selection)) {
    console.warn('Text is selected');
    return;
  }

  const tr = view.state.tr;
  const {$cursor} = view.state.selection;
  const suggestionMark = view.state.doc.type.schema.marks.suggestion.create();

  tr.addMark($cursor.pos - 1, $cursor.pos, suggestionMark)
    .setMeta('suggestion-stage', 'enter');

  view.dispatch(tr);
}
