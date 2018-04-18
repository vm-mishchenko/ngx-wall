import { ChangeDetectorRef, Component, ElementRef, NgZone } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import { BaseTextBrickComponent } from '../../base-text-brick/base-text-brick.component';
import { ContextModalService } from '../../modules/modal';
import { ImgEncoder } from '../../modules/utils/img-encoder.service';
import { NodeTreeSplit } from '../../modules/utils/node-tree-split';
import { WallApi } from '../../wall';
import { BricksListComponent } from '../bricks-list/bricks-list.component';

@Component({
    selector: 'text-brick',
    templateUrl: './text-brick-component.component.html'
})
export class TextBrickComponent extends BaseTextBrickComponent {
    placeholder = null;

    modalRef: NgbModalRef;
    up$ = new Subject();
    down$ = new Subject();
    enter$ = new Subject();
    selectedTag$: Subject<string> = new Subject();

    constructor(wallApi: WallApi,
                private contextModalService: ContextModalService,
                private zone: NgZone,
                private cd: ChangeDetectorRef,
                private el: ElementRef) {
        super(wallApi);

        this.selectedTag$.subscribe((newTag) => {
            if (newTag) {
                this.hideBricksList();

                this.wallApi.core.turnBrickInto(this.id, newTag);

                // d - divider tag
                if (newTag === 'd') {
                    this.wallApi.core.addBrickAfterBrickId(this.id, 'text');
                }
            }
        });
    }

    onBlur() {
        this.placeholder = null;
    }

    onFocus() {
        this.placeholder = 'Type \'/\' for commands';
    }

    topKeyPressed(e: KeyboardEvent) {
        if (this.modalRef) {
            e.preventDefault();
            e.stopPropagation();

            this.up$.next();
        } else {
            super.topKeyPressed(e);
        }
    }

    bottomKeyPressed(e: KeyboardEvent) {
        if (this.modalRef) {
            e.preventDefault();
            e.stopPropagation();

            this.down$.next();
        } else {
            super.bottomKeyPressed(e);
        }
    }

    enterKeyPressed(e: KeyboardEvent) {
        if (this.modalRef) {
            this.enter$.next();

            setTimeout(() => {
                this.hideBricksList();
            }, 10);
        } else {
            if (this.isTag()) {
                const newTag = this.scope.text.slice(1);

                this.wallApi.core.turnBrickInto(this.id, newTag);

                // d - divider tag
                if (newTag === 'd') {
                    this.wallApi.core.addBrickAfterBrickId(this.id, 'text');
                }
            } else {
                super.enterKeyPressed(e);
            }
        }
    }

    getLeftRightText(offset: number, target: Node): { left: string, right: string } {
        const nodeTreeSplit = new NodeTreeSplit(this.editor.nativeElement, target, offset);

        return {
            left: nodeTreeSplit.leftTree.innerHTML,
            right: nodeTreeSplit.rightTree.innerHTML
        };
    }

    escapeKeyPressed(e: KeyboardEvent) {
        if (this.modalRef) {
            e.preventDefault();
            e.stopPropagation();

            this.hideBricksList();
        }
    }

    onTextChange() {
        super.onTextChange();

        if (this.modalRef) {
            if (!this.scope.text.length) {
                this.hideBricksList();
            }
        } else if (this.scope.text[0] === '/' && this.scope.text.length === 1) {
            this.editor.nativeElement.blur();

            const elementBoundingRect = this.el.nativeElement.getBoundingClientRect();

            this.modalRef = this.contextModalService.open({
                component: BricksListComponent,
                componentData: {
                    text$: this.textChange,
                    up$: this.up$,
                    down$: this.down$,
                    enter$: this.enter$,
                    selectedTag$: this.selectedTag$
                },
                context: {
                    coordinate: {
                        x: elementBoundingRect.x,
                        y: elementBoundingRect.y + 35
                    }
                }
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
                this.wallApi.core.turnBrickInto(this.id, 'image', {
                    src: imgBase64
                });
            });
        } else {
            super.onPaste(e);
        }
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
            this.wallApi.core.isRegisteredBrick(this.scope.text.slice(1));
    }

    private hideBricksList() {
        if (this.modalRef) {
            this.modalRef.close();

            this.modalRef = null;
        }
    }
}
