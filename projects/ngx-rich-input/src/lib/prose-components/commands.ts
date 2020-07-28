import {Selection} from 'prosemirror-state';
import {DOMParser, DOMSerializer, Schema} from 'prosemirror-model';

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

