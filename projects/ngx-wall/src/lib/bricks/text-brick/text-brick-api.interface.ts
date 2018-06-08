export interface ITextBrickApi {
    bold(): void;

    italic(): void;

    createLink(url: string): void;

    changeLinkUrl(url: string): void;

    isLinkSelected(): boolean;

    getSelectedLinkHref(): string;

    unlink(): void;

    saveSelection();

    restoreSelection();
}
