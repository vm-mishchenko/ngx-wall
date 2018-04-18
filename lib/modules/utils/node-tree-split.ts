export class NodeTreeSplit {
    leftTree: HTMLElement;
    rightTree: HTMLElement;

    private parentNodes: HTMLElement[] = [];

    constructor(private root: HTMLElement,
                private target: Node,
                private offset: number) {
        this.parentNodes = this.calculateParentNodes();

        if (this.parentNodes.length) {
            this.leftTree = this.calculateLeftTree();
            this.rightTree = this.calculateRightTree();
        } else {
            this.leftTree = this.rightTree = document.createElement('P');
        }
    }

    calculateLeftTree() {
        const parentClones = this.parentNodes.map((parentNode) => this.getCloneWithChildren(parentNode, 'left'));

        const lastNode = parentClones[parentClones.length - 1];

        lastNode.appendChild(document.createTextNode(this.target.textContent.slice(0, this.offset)));

        for (let i = 0; i < parentClones.length; i++) {
            if (i !== 0) {
                const parentClone = parentClones[i - 1];
                const childClone = parentClones[i];

                // add only node which contains any useful information
                if (childClone.textContent.length) {
                    parentClone.appendChild(childClone);
                }
            }
        }

        return parentClones[0];
    }

    calculateRightTree() {
        const parentClones = this.parentNodes.map((parentNode) => this.getCloneWithChildren(parentNode, 'right'));

        const lastNode = parentClones[parentClones.length - 1];

        lastNode.prepend(document.createTextNode(this.target.textContent.slice(this.offset)));

        for (let i = 0; i < parentClones.length; i++) {
            if (i !== 0) {
                const parentClone = parentClones[i - 1];
                const childClone = parentClones[i];

                // add only node which contains any useful information
                if (childClone.textContent.length) {
                    parentClone.prepend(childClone);
                }
            }
        }

        return parentClones[0];
    }

    getCloneWithChildren(node, side) {
        const nodeClone = document.createElement(node.tagName);

        let i = side === 'left' ? 0 : (node.childNodes.length - 1);

        let currentNode = node.childNodes[i];

        while (currentNode && currentNode !== this.target && this.parentNodes.indexOf(currentNode) === -1) {
            const currentNodeClone = currentNode.cloneNode(true);

            if (side === 'left') {
                nodeClone.appendChild(currentNodeClone);
                i++;
            } else {
                nodeClone.prepend(currentNodeClone);
                i--;
            }

            currentNode = node.childNodes[i];
        }

        return nodeClone;
    }

    calculateParentNodes() {
        const parentNodes = [];
        let currentNode: any = this.target;

        while (currentNode !== this.root) {
            parentNodes.push(currentNode.parentNode);

            currentNode = currentNode.parentNode;
        }

        return parentNodes.reverse();
    }
}
