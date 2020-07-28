import {Selection} from 'prosemirror-state';

export function setCursorAtTheStart(state, dispatch) {
  dispatch(
    state.tr.setSelection(Selection.atStart(state.doc))
  );
}
