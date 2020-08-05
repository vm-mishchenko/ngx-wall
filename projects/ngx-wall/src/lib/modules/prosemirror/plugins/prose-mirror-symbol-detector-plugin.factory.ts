import {Plugin, PluginKey} from 'prosemirror-state';
import {ReplaceStep} from 'prosemirror-transform';
import {getTextBeforeResolvedPos} from '../prose-components/commands';

export function symbolDetectorPluginFactory({
                                              characters,
                                              appendTransaction = (context) => {
                                                // do nothing
                                              }
                                            }) {

  if (!characters) {
    throw new Error('Characters are required');
  }

  const pluginKey = new PluginKey('StrongSymbolDetectorPlugin');

  function findClosestLeftSubStringPos(string, subString) {
    let scanned = '';

    for (let i = string.length - 1; i >= 0; i--) {
      scanned += string[i];

      if (hasSubStringAtTheEnd(scanned, subString)) {
        return i;
      }
    }

    return -1;
  }

  function reverseString(text) {
    return text.split('').reverse().join('');
  }

  function hasSubStringAtTheEnd(text: string, subString: string) {
    return reverseString(text).indexOf(subString) === 0;
  }

  return new Plugin({
    key: pluginKey,

    appendTransaction(transactions, oldState, newState) {
      const {active, match} = pluginKey.getState(newState);

      if (active) {
        return appendTransaction({newState, match});
      }
    },

    state: {
      init() {
        return {
          active: false,
          match: {}
        };
      },

      apply(tr, prevValue, oldState, newState) {
        if (!tr.docChanged) {
          // ignore if doc was not changed
          console.log(`Ignore: doc is not changed`);
          return {active: false, match: {}};
        }

        // check that symbol is added by that tr
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
        if (!replaceStepContent.length) {
          console.log(`Ignore: transaction does't add any text.`);
          return {active: false, match: {}};
        }

        // check that from cursor to the left side is a match with characters
        const text = getTextBeforeResolvedPos(tr.curSelection.$cursor);

        if (!hasSubStringAtTheEnd(text, characters)) {
          console.log(`Ignore: characters does not match pattern: ${text}`);
          return {active: false, match: {}};
        }

        // need to find position of closest corresponding characters on the left side
        const closestLeftCharsPos = findClosestLeftSubStringPos(text.slice(0, -characters.length), characters);

        if (closestLeftCharsPos === -1) {
          console.log(`Ignore: characters match pattern, but there is no opening characters: ${text}`);
          return {active: false, match: {}};
        }
        // check if there is "space" near the characters
        // **te st** - valid
        // ** text** - invalid
        // ** text ** - invalid
        // **text ** - invalid

        // |**text** - fromTriggersPos
        // **text**| - toTriggersPos
        // **|text** - fromPos
        // **text|** - toPos
        const fromTriggersPos = closestLeftCharsPos;
        const toTriggersPos = tr.curSelection.$cursor.pos;
        const fromPos = fromTriggersPos + characters.length;
        const toPos = toTriggersPos - characters.length;

        const textBetween = tr.doc.textBetween(fromPos, toPos);

        if (!textBetween.length) {
          console.log(`Ignore: No text between characters`);
          return {active: false, match: {}};
        }

        if (textBetween[0] === ' ') {
          console.log(`Ignore: First left symbol is space`);
          return {active: false, match: {}};
        }

        if (textBetween[textBetween.length - 1] === ' ') {
          console.log(`Ignore: Last right symbol is space`);
          return {active: false, match: {}};
        }

        return {
          active: true, match: {
            fromTriggersPos,
            toTriggersPos,
            fromPos,
            toPos,
            textBetween: tr.doc.textBetween(fromPos, toPos)
          }
        };
      }
    }
  });
}
