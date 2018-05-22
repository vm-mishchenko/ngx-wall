export class DeepRightNodeChild {
    child: Node;

    constructor(root: HTMLElement) {
        let currentNode: Node = root;

        while (currentNode.childNodes.length) {
            currentNode = currentNode.childNodes[currentNode.childNodes.length - 1];
        }

        this.child = currentNode;
    }
}
