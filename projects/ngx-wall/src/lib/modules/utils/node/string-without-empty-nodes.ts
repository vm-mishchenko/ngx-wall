/**
 * Returns string which does not contains empty nodes inside
 */
export class StringWithoutEmptyNodes {
    constructor(private str: string) {
    }

    get() {
        const pNode = document.createElement('P');

        pNode.innerHTML = this.str;

        if (!pNode.textContent.trim().length) {
            // there are no text itself, so replace any tags to empty string
            return '';
        } else {
            return this.str;
        }
    }
}
