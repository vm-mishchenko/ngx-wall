export class FirstSubStringNode {
    firstLevelSubStringNodes: Node[] = [];

    private readonly subString: string;

    constructor(private root: HTMLElement, private subStringHTML: string) {
        // get text representation
        this.subString = this.getSubStringTextContent();

        if (subStringHTML.length !== 0) {
            if (this.root.childNodes.length === 1) {
                this.firstLevelSubStringNodes = Array.from(this.root.childNodes);

            } else if (this.root.childNodes.length > 1) {
                this.firstLevelSubStringNodes = this.findFirstLevelSubStringNodes();
            }
        }
    }

    private findFirstLevelSubStringNodes() {
        let i = this.root.childNodes.length - 1;
        let currentNode = this.root.childNodes[i];
        let text = '';
        const firstLevelSubStringNodes = [];

        while (currentNode && !text.includes(this.subString)) {
            text = currentNode.textContent + text;

            firstLevelSubStringNodes.push(currentNode);

            i--;
            currentNode = this.root.childNodes[i];
        }

        return firstLevelSubStringNodes.reverse();
    }

    private getSubStringTextContent(): string {
        const pNode = document.createElement('P');

        pNode.innerHTML = this.subStringHTML;

        return pNode.textContent;
    }
}
