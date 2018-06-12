export class CursorPositionInLine {
    isOnLastLine: boolean;
    isOnFirstLine: boolean;

    constructor(private leftText: string, private rightText: string, private targetNode: HTMLElement) {
        if (leftText === '' && rightText === '') {
            this.isOnFirstLine = true;
            this.isOnLastLine = true;
        } else {
            // http://jsbin.com/qifezupu/31/edit?js,output

            const div = this.createElementClone(this.targetNode);

            document.body.appendChild(div);

            const span1 = document.createElement('SPAN');
            const span2 = document.createElement('SPAN');

            div.appendChild(span1);
            div.appendChild(span2);

            span1.innerText = 'a';

            const lh = span1.offsetHeight;

            span1.innerHTML = leftText;
            span2.innerHTML = rightText;

            this.isOnFirstLine = span1.textContent.length === 0 ||
                (span1.offsetHeight === lh && span1.getBoundingClientRect().top === span2.getBoundingClientRect().top);

            this.isOnLastLine = span2.offsetHeight === lh;

            div.remove();
        }
    }

    private createElementClone(node: HTMLElement): HTMLElement {
        const div = document.createElement('DIV');

        const style = getComputedStyle(node);

        [].forEach.call(style, (prop) => {
            div.style[prop] = style[prop];
        });

        return div;
    }
}
