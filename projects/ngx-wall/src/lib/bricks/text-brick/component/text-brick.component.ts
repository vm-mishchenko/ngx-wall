import {ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {StickyModalRef, StickyModalService, StickyPositionStrategy} from 'ngx-sticky-modal';
import {fromEvent, Subject, Subscription} from 'rxjs';
import {debounceTime, filter} from 'rxjs/operators';
import {ImgEncoder} from '../../../modules/utils/img-encoder.service';
import {NodeTreeSplit} from '../../../modules/utils/node-tree-split';
import {TreeNodeTraverse} from '../../../modules/utils/node/tree-node-traverse';
import {BaseTextBrickComponent} from '../../base-text-brick/base-text-brick.component';
import {BricksListComponent} from '../bricks-list/bricks-list.component';
import {ITextBrickApi} from '../text-brick-api.interface';
import {TextContextMenuComponent} from '../text-context-menu/text-context-menu.component';
import {IWallModel} from '../../../wall/model/interfaces/wall-model.interface';
import {DIVIDER_BRICK_TAG} from '../../divider-brick/divider-brick.constant';

@Component({
    selector: 'text-brick',
    templateUrl: './text-brick.component.html',
    styleUrls: ['./text-brick.component.scss']
})
export class TextBrickComponent extends BaseTextBrickComponent implements OnInit, OnDestroy, ITextBrickApi {
    @Input() wallModel: IWallModel;

    placeholder = null;

    brickSelectionModalRef: StickyModalRef;
    contextMenuModalRef: StickyModalRef;

    up$ = new Subject();
    down$ = new Subject();
    enter$ = new Subject();
    selectedTag$: Subject<string> = new Subject();

    subscriptions: Subscription[] = [];

    selectionInfo: {
        ranges: Range[],
        selectedLink: HTMLElement
    };

    api: ITextBrickApi = {
        bold: this.bold.bind(this),
        italic: this.italic.bind(this),
        createLink: this.createLink.bind(this),
        changeLinkUrl: this.changeLinkUrl.bind(this),
        isLinkSelected: this.isLinkSelected.bind(this),
        getSelectedLinkHref: this.getSelectedLinkHref.bind(this),
        saveSelection: this.saveSelection.bind(this),
        restoreSelection: this.restoreSelection.bind(this),
        unlink: this.unlink.bind(this)
    };

    constructor(private zone: NgZone,
                private ngxStickyModalService: StickyModalService,
                private cd: ChangeDetectorRef,
                private componentFactoryResolver: ComponentFactoryResolver,
                private el: ElementRef) {
        super();

        this.selectedTag$.subscribe((newTag) => {
            if (newTag) {
                this.hideBricksList();

                this.wallModel.api.core.turnBrickInto(this.id, newTag);

                if (newTag === DIVIDER_BRICK_TAG) {
                    this.wallModel.api.core.addBrickAfterBrickId(this.id, 'text');
                }
            }
        });

        this.subscriptions.push(
            // show sub-menu for selected text
            fromEvent(this.el.nativeElement, 'mouseup')
                .pipe(
                    filter(() => Boolean(this.scope.text.length)),
                    debounceTime(500),
                    filter(() => this.el.nativeElement.contains(window.getSelection().anchorNode))
                )
                .subscribe((e: any) => {
                    this.onTextSelection();
                })
        );
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    onBlur() {
        this.placeholder = null;
    }

    onFocus() {
        this.placeholder = 'Type \'/\' for commands';
    }

    onKeyPress(e: KeyboardEvent) {
        super.onKeyPress(e);

        this.hideContextMenuModal();
    }

    // open the link in new window
    onClick(event: MouseEvent) {
        const target = event.target as Node;

        if (this.isHTMLElement(target)) {
            if (target.tagName === 'A') {
                window.open(target.getAttribute('href'), '_blank');
            }
        }
    }

    topKeyPressed(e: KeyboardEvent) {
        if (this.brickSelectionModalRef) {
            e.preventDefault();
            e.stopPropagation();

            this.up$.next();
        } else {
            super.topKeyPressed(e);
        }
    }

    bottomKeyPressed(e: KeyboardEvent) {
        if (this.brickSelectionModalRef) {
            e.preventDefault();
            e.stopPropagation();

            this.down$.next();
        } else {
            super.bottomKeyPressed(e);
        }
    }

    enterKeyPressed(e: KeyboardEvent) {
        if (this.brickSelectionModalRef) {
            this.enter$.next();

            setTimeout(() => {
                this.hideBricksList();
            }, 10);
        } else {
            if (this.isTag()) {
                const newTag = this.scope.text.slice(1);

                this.wallModel.api.core.turnBrickInto(this.id, newTag);

                // d - divider tag
                if (newTag === 'd') {
                    this.wallModel.api.core.addBrickAfterBrickId(this.id, 'text');
                }
            } else {
                super.enterKeyPressed(e);
            }
        }
    }

    getSplittedText(offset: number, target: Node): { left: string, right: string } {
        const nodeTreeSplit = new NodeTreeSplit(this.editor.nativeElement, target, offset);

        return {
            left: nodeTreeSplit.leftTree.innerHTML,
            right: nodeTreeSplit.rightTree.innerHTML
        };
    }

    escapeKeyPressed(e: KeyboardEvent) {
        if (this.brickSelectionModalRef) {
            e.preventDefault();
            e.stopPropagation();

            this.hideBricksList();
        }
    }

    onTextChange() {
        super.onTextChange();

        if (this.brickSelectionModalRef) {
            if (!this.scope.text.length) {
                this.hideBricksList();
            }
        } else if (this.scope.text[0] === '/' && this.scope.text.length === 1) {
            this.editor.nativeElement.blur();

            const elementBoundingRect = this.el.nativeElement.getBoundingClientRect();

            this.brickSelectionModalRef = this.ngxStickyModalService.open({
                component: BricksListComponent,
                data: {
                    text$: this.textChange,
                    up$: this.up$,
                    down$: this.down$,
                    enter$: this.enter$,
                    selectedTag$: this.selectedTag$
                },
                positionStrategy: {
                    name: StickyPositionStrategy.coordinate,
                    options: {
                        clientX: elementBoundingRect.x,
                        clientY: elementBoundingRect.y + 35
                    }
                },
                componentFactoryResolver: this.componentFactoryResolver
            });

            setTimeout(() => {
                this.editor.nativeElement.focus();
            });
        }
    }

    onPaste(e: ClipboardEvent) {
        const imageDataTransferItem = this.extractImageDataTransferItem(e.clipboardData.items);

        if (imageDataTransferItem) {
            e.preventDefault();

            (new ImgEncoder(imageDataTransferItem.getAsFile())).getBase64Representation().then((imgBase64) => {
                this.wallModel.api.core.turnBrickInto(this.id, 'image', {
                    src: imgBase64
                });
            });
        } else {
            super.onPaste(e);
        }
    }

    onTextSelection() {
        if (!this.contextMenuModalRef) {
            const selection = window.getSelection();

            if (!selection.isCollapsed) {
                this.showContextModal();
            }
        }
    }

    // API
    bold(): void {
        document.execCommand('bold', false);
    }

    italic(): void {
        document.execCommand('italic', false);
    }

    createLink(url: string): void {
        document.execCommand('createLink', false, url);
    }

    getSelectedLinkHref(): string {
        if (this.selectionInfo.selectedLink) {
            return this.selectionInfo.selectedLink.getAttribute('href');
        }
    }

    unlink(): void {
        document.execCommand('unlink', false);
    }

    changeLinkUrl(url: string): void {
        if (this.selectionInfo.selectedLink) {
            this.selectionInfo.selectedLink.setAttribute('href', url);

            this.triggerEditorChange();
        }
    }

    isLinkSelected(): boolean {
        return Boolean(this.selectionInfo && this.selectionInfo.selectedLink);
    }

    saveSelection() {
        this.selectionInfo = {
            selectedLink: this.getSelectedLink(),
            ranges: this.getSelectedRanges()
        };
    }

    restoreSelection() {
        const sel = window.getSelection();

        sel.removeAllRanges();

        for (let i = 0, len = this.selectionInfo.ranges.length; i < len; ++i) {
            sel.addRange(this.selectionInfo.ranges[i]);
        }
    }

    // end API

    private getSelectedLink(): HTMLElement {
        const selection = window.getSelection();

        let anchorNodeLink;
        let focusNodeLink;

        const isAnchorNodeBelongToBrick = this.el.nativeElement.contains(selection.anchorNode);
        const isFocusNodeBelongToBrick = this.el.nativeElement.contains(selection.focusNode);

        if (isAnchorNodeBelongToBrick) {
            anchorNodeLink = this.findParentLink(selection.anchorNode);
        }

        if (isFocusNodeBelongToBrick) {
            focusNodeLink = this.findParentLink(selection.focusNode);
        }

        if (anchorNodeLink) {
            return anchorNodeLink;
        } else if (focusNodeLink) {
            return focusNodeLink;
        } else if (selection.anchorNode !== selection.focusNode &&
            isFocusNodeBelongToBrick && isAnchorNodeBelongToBrick) {
            return this.findLinkBetweenNodes(selection.anchorNode, selection.focusNode);
        }
    }

    private triggerEditorChange() {
        this.editor.nativeElement.dispatchEvent(new Event('input'));
    }

    private showContextModal() {
        this.editor.nativeElement.blur();

        const sel = window.getSelection();

        const elementBoundingRect = sel.getRangeAt(0).getBoundingClientRect();

        this.contextMenuModalRef = this.ngxStickyModalService.open({
            component: TextContextMenuComponent,
            data: {
                api: this.api
            },
            positionStrategy: {
                name: StickyPositionStrategy.coordinate,
                options: {
                    clientX: elementBoundingRect.left + ((elementBoundingRect.right - elementBoundingRect.left) / 2.5),
                    clientY: elementBoundingRect.top - 35
                }
            },
            overlayConfig: {
                hasBackdrop: false
            },
            componentFactoryResolver: this.componentFactoryResolver
        });

        this.contextMenuModalRef.result.then(() => {
            this.hideContextMenuModal();
        }, () => {
            this.hideContextMenuModal();
        });

        setTimeout(() => {
            this.editor.nativeElement.focus();
        });
    }

    // todo: might be as util method
    private getSelectedRanges(): Range[] {
        const sel = window.getSelection();
        const ranges = [];

        for (let i = 0, len = sel.rangeCount; i < len; ++i) {
            ranges.push(sel.getRangeAt(i));
        }

        return ranges;
    }

    private extractImageDataTransferItem(items: DataTransferItemList): DataTransferItem {
        let index;

        for (index in items) {
            if (items.hasOwnProperty(index)) {
                const item = items[index];

                if (item.kind === 'file') {
                    return item;
                }
            }
        }
    }

    private isTag() {
        return this.scope.text && this.scope.text[0] === '/' &&
            this.wallModel.api.core.isRegisteredBrick(this.scope.text.slice(1));
    }

    private hideBricksList() {
        if (this.brickSelectionModalRef) {
            this.brickSelectionModalRef.close();

            this.brickSelectionModalRef = null;
        }
    }

    private hideContextMenuModal() {
        if (this.contextMenuModalRef) {
            this.contextMenuModalRef.close();

            this.contextMenuModalRef = null;
        }
    }

    private findParentLink(node: Node): HTMLElement {
        let currentNode: Node = node;
        let linkNode = null;

        while (!linkNode && currentNode !== this.el.nativeElement) {
            if ((currentNode as HTMLElement).tagName === 'A') {
                linkNode = currentNode;
            }

            currentNode = currentNode.parentElement;
        }

        return linkNode;
    }

    private findLinkBetweenNodes(nodeA: Node, nodeB: Node): HTMLElement {
        const treeNodeTraverse = new TreeNodeTraverse(this.editor.nativeElement);

        const orderedNodes = treeNodeTraverse.getPostPreOrderNodes();

        let nodeAIndex = orderedNodes.indexOf(nodeA);
        let nodeBIndex = orderedNodes.indexOf(nodeB);

        if (nodeBIndex < nodeAIndex) {
            const temp = nodeBIndex;

            nodeBIndex = nodeAIndex;
            nodeAIndex = temp;
        }

        const orderedNodesBetweenNodes = orderedNodes.slice(nodeAIndex, nodeBIndex);

        const linkNodes = orderedNodesBetweenNodes.filter((node) => {
            if (this.isHTMLElement(node)) {
                return node.tagName === 'A';
            }
        });

        return linkNodes[0] as HTMLElement;
    }

    private isHTMLElement(node: Node | HTMLElement): node is HTMLElement {
        return (node as HTMLElement).querySelector !== undefined;
    }
}
