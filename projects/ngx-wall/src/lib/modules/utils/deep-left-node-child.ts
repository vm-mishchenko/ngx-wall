export class DeepLeftNodeChild {
    child: Node;

    constructor(root: Node) {
        let currentNode: Node = root;

        while (currentNode.childNodes.length) {
            currentNode = currentNode.childNodes[0];
        }

        this.child = currentNode;
    }
}
