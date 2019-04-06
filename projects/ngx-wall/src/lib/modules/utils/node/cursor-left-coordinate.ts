export class CursorLeftCoordinate {
    constructor(private leftText: string, private rightText: string, private targetNode: HTMLElement) {
    }

    get(): number {
        const div = this.createElementClone(this.targetNode);
        const span = document.createElement('SPAN');

        div.innerHTML = this.leftText;
        span.innerHTML = this.rightText;

        div.appendChild(span);

        // make sure element stay at top left corner
        div.style.position = 'absolute';
        div.style.top = '0';
        div.style.left = '0';
        div.style.padding = '0';
        div.style.margin = '0';

        document.body.appendChild(div);

        const leftCoordinate = span.offsetLeft;

        div.remove();

        return leftCoordinate;
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
