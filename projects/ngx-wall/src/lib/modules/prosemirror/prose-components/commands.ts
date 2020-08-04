import {Selection} from 'prosemirror-state';

export function setCursorAtTheStart(state, dispatch) {
  dispatch(
    state.tr.setSelection(Selection.atStart(state.doc))
  );
}

export function isTextSelected(selection) {
  // another way to test it - if ($cursor = null) text is selected
  return !selection.empty;
}

export function findNode(fragmentOrNode, predicate: (node, pos, parent) => boolean): { node: any, pos: number } {
  let firstMatchedNode;
  let firstMatchedNodePos;

  fragmentOrNode.descendants((node, pos, parent) => {
    if (predicate(node, pos, parent)) {
      firstMatchedNode = node;
      firstMatchedNodePos = pos;

      // skip all next nodes
      return false;
    }
  });

  if (!firstMatchedNode) {
    return null;
  }

  return {
    node: firstMatchedNode,
    pos: firstMatchedNodePos
  };
}

export function doesNodeHaveMarkType(node, markType): boolean {
  return Boolean(markType.isInSet(node.marks));
}

export function isResPositionBetweenNodes(resolvedPos): boolean {
  return resolvedPos.textOffset === 0;
}

export function getDocTextRepresentation(doc) {
  return doc.textContent;
}

export function getCurrentNode(selection) {
  // For all these cases Node is not determined
  // 1. <node>|<node>
  // 2. |<node>...
  // 3. ...<node>|

  if (isTextSelected(selection) || isCursorBetweenNodes(selection)) {
    return;
  }

  const $cursor = selection.$cursor;

  return $cursor.parent.child($cursor.index());
}

export function isCursorBetweenNodes(selection) {
  if (isTextSelected(selection)) {
    return;
  }

  return isResPositionBetweenNodes(selection.$cursor);
}

// get text/HTML functions
export function getHTMLRepresentation(node, serializer) {
  const documentFragment = serializer.serializeFragment(node.content);
  const div = document.createElement('DIV');

  div.append(documentFragment);

  return div.innerHTML;
}

export function getTextFromAndTo(doc, from, to) {
  return doc.textBetween(from, to);
}

export function getTextBeforeResolvedPos(resolvedPos) {
  return getTextFromAndTo(resolvedPos.parent, 0, resolvedPos.pos);
}

export function getTextAfterResolvedPos(resolvedPos) {
  // Create a copy of this node with only the content between the given positions.
  const cutDoc = resolvedPos.parent.cut(resolvedPos.pos);

  return getDocTextRepresentation(cutDoc);
}

export function getSelectedText(state) {
  // need to replace to `textBetween` call
  const $to = state.selection.$to;
  const $from = state.selection.$from;

  // Create a copy of this node with only the content between the given positions.
  const doc = $from.parent.cut($from.pos, $to.pos);

  return getDocTextRepresentation(doc);
}

export function getHTMLBeforeResolvedPos(resolvedPos, serializer) {
  // Create a copy of this node with only the content between the given positions.
  const doc = resolvedPos.parent.cut(0, resolvedPos.pos);

  return getHTMLRepresentation(doc, serializer);
}

export function getHTMLAfterResolvedPos(resolvedPos, serializer) {
  // Create a copy of this node with only the content between the given positions.
  const doc = resolvedPos.parent.cut(resolvedPos.pos);

  return getHTMLRepresentation(doc, serializer);
}
