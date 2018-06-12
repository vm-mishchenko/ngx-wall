export class CaretStartEndPosition {
    constructor(private el: Node) {
    }

    isCaretAtEnd(): boolean {
        let result = false;
        const sel = window.getSelection();

        if (sel.rangeCount) {
            const selRange = sel.getRangeAt(0);
            const testRange = selRange.cloneRange();

            testRange.selectNodeContents(this.el);
            testRange.setStart(selRange.endContainer, selRange.endOffset);
            result = (testRange.toString().trim() === '');
        }

        return result;
    }

    isCaretAtStart(): boolean {
        let result = false;
        const sel = window.getSelection();

        if (sel.rangeCount) {
            const selRange = sel.getRangeAt(0);
            const testRange = selRange.cloneRange();

            testRange.selectNodeContents(this.el);
            testRange.setEnd(selRange.startContainer, selRange.startOffset);
            result = (testRange.toString().trim() === '');
        }

        return result;
    }
}
