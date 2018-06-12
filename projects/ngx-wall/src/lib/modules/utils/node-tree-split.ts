export class NodeTreeSplit {
    leftTree: HTMLElement;
    rightTree: HTMLElement;

    constructor(private root: HTMLElement,
                private targetElement: Node, // text node
                private offset: number) {
        if (root === targetElement) {
            // edge case scenario, just return root node itself
            this.leftTree = root as HTMLElement;
            this.rightTree = root as HTMLElement;
        } else {
            // get direct parent of target node
            let parent = targetElement.parentNode;

            // create left and right trees which will be returned as result
            let rightTree = parent.cloneNode(false);
            let leftTree = parent.cloneNode(false);

            // Build Right tree

            // as soon as targetElement is a Text Node, split text of that node using offset
            rightTree.appendChild(
                document.createTextNode(targetElement.textContent.slice(offset))
            );

            // parent node could contains other Nodes besides target node
            // add all next siblings of target node to the right tree
            this.appendNextSiblingsToNode(rightTree, targetElement);

            // Build Left tree

            // as soon as targetElement is a Text Node, split text of that node using offset
            leftTree.appendChild(
                document.createTextNode(targetElement.textContent.slice(0, offset))
            );

            // parent node could contains other Nodes besides target node
            // add all previous siblings of target node to the left tree
            this.prependPreviousSiblingsToNode(leftTree, targetElement);

            if (root === parent) {
                // we already fully build left and right trees
                this.leftTree = leftTree as HTMLElement;
                this.rightTree = rightTree as HTMLElement;
            } else {
                // recursively build left and right trees
                // climbing from parent node to the root node
                let leftParentTree;
                let rightParentTree;
                let grandparent = parent.parentNode;

                while (root.contains(grandparent) || grandparent === root) {
                    rightParentTree = grandparent.cloneNode(false);
                    leftParentTree = grandparent.cloneNode(false);

                    // Process Left tree
                    this.prependPreviousSiblingsToNode(leftParentTree, parent);

                    leftParentTree.appendChild(leftTree);
                    leftTree = leftParentTree;

                    // Process Right tree
                    this.appendNextSiblingsToNode(rightParentTree, parent);

                    rightParentTree.prepend(rightTree);
                    rightTree = rightParentTree;

                    parent = grandparent;
                    grandparent = grandparent.parentNode;
                }

                this.leftTree = leftTree as HTMLElement;
                this.rightTree = rightTree as HTMLElement;
            }
        }
    }

    private prependPreviousSiblingsToNode(leftTree, targetNode: Node): void {
        let previousSibling = targetNode.previousSibling;

        while (previousSibling) {
            leftTree.prepend(previousSibling.cloneNode(true));

            previousSibling = previousSibling.previousSibling;
        }
    }

    private appendNextSiblingsToNode(rightTree, targetElement: Node): void {
        let nextSibling = targetElement.nextSibling;

        while (nextSibling) {
            rightTree.appendChild(nextSibling.cloneNode(true));

            nextSibling = nextSibling.nextSibling;
        }
    }
}
