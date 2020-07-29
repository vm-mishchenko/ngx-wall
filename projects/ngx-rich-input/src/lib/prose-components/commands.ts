import {Selection} from 'prosemirror-state';

export function setCursorAtTheStart(state, dispatch) {
  dispatch(
    state.tr.setSelection(Selection.atStart(state.doc))
  );
}

export function getHTMLRepresentation(node, serializer) {
  const documentFragment = serializer.serializeFragment(node.content);
  const div = document.createElement('DIV');

  div.append(documentFragment);

  return div.innerHTML;
}

export function isTextSelected(selection) {
  // another way to test it - if ($cursor = null) text is selected
  return !selection.empty;
}

