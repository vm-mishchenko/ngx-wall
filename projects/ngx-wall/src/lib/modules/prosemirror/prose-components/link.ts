export const linkSchema = {
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
};
