export class CursorLeftCoordinate {
    constructor(private leftText: string, private rightText: string, private targetNode: HTMLElement) {
    }

    get(): number {
        const div = this.createElementClone(this.targetNode);
        const span = document.createElement('SPAN');

        div.innerHTML = this.leftText;
        span.innerHTML = this.rightText;

        div.appendChild(span);

        div.style.position = 'absolute';

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
