export class PlaceCaretToPosition {
    constructor(private el: Node, private position: number) {
    }

    place() {
        const range = document.createRange();
        const sel = window.getSelection();

        range.setStart(this.el, this.position);

        sel.removeAllRanges();
        sel.addRange(range);
    }
}
