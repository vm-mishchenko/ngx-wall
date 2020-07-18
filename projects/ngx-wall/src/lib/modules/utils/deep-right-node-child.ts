export class DeepRightNodeChild {
    child: Node;

    constructor(root: HTMLElement) {
        let currentNode: Node = root;

        while (currentNode.childNodes.length) {
            const childNodeArray = Array.from(currentNode.childNodes);
            const lastNode = currentNode.childNodes[currentNode.childNodes.length - 1];

            // remove last BR element, which cause trouble in Firefox
            if (lastNode.nodeName === 'BR') {
                childNodeArray.splice(-1);
            }

            currentNode = childNodeArray[childNodeArray.length - 1];
        }

        this.child = currentNode;
    }
}
