export class TreeNodeTraverse {
    constructor(private root: HTMLElement) {
    }

    traversePostOrder(fn: (node: Node) => void) {
        this._traversePostOrder(this.root, fn);
    }

    traversePreOrder(fn: (node: Node) => void) {
        this._traversePreOrder(this.root, fn);
    }

    traversePostPreOrder(fn: (node: Node) => void) {
        this._traversePostPreOrder(this.root, fn);
    }

    getPreOrderNodes(): Node[] {
        const nodes = [];

        this.traversePreOrder((node) => {
            nodes.push(node);
        });

        return nodes;
    }

    getPostOrderNodes(): Node[] {
        const nodes = [];

        this.traversePostOrder((node) => {
            nodes.push(node);
        });

        return nodes;
    }

    getPostPreOrderNodes(): Node[] {
        const nodes = [];

        this.traversePostPreOrder((node) => {
            nodes.push(node);
        });

        return nodes;
    }

    private _traversePostOrder(node: Node, fn: (node: Node) => void) {
        Array.from(node.childNodes).forEach((childNode) => {
            if (childNode.childNodes && childNode.childNodes.length) {
                this._traversePostOrder(childNode, fn);
            }

            fn(childNode);
        });
    }

    private _traversePreOrder(node: Node, fn: (node: Node) => void) {
        Array.from(node.childNodes).forEach((childNode) => {
            fn(childNode);

            if (childNode.childNodes && childNode.childNodes.length) {
                this._traversePreOrder(childNode, fn);
            }
        });
    }

    private _traversePostPreOrder(node: Node, fn: (node: Node) => void) {
        Array.from(node.childNodes).forEach((childNode) => {
            fn(childNode);

            if (childNode.childNodes && childNode.childNodes.length) {
                this._traversePostPreOrder(childNode, fn);
            }

            fn(childNode);
        });
    }
}
