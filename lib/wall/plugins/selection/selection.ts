import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { EndPickOut, PickOutItems, PickOutService, StartPickOut } from '../../../modules/pick-out';
import { DropEvent, StartWorkingEvent, StopWorkingEvent, TOW, TowService } from '../../../modules/tow';
import { WallApi } from '../../components/wall';

@Injectable()
export class SelectionPlugin {
    doc: any = null;

    isMouseSelection: boolean = false;
    onClickHandlerBound: any;
    onKeyDownHandlerBound: any;
    onSelectionChangeBound: any;
    private towServiceSubscription: Subscription;
    private pickOutServiceSubscription: Subscription;

    constructor(private wallApi: WallApi,
                private pickOutService: PickOutService,
                private towService: TowService,
                @Inject(DOCUMENT) doc) {
        this.doc = doc;

        this.initialize();
    }

    initialize() {
        this.onClickHandlerBound = this.onClickHandler.bind(this);
        this.onKeyDownHandlerBound = this.onKeyDownHandler.bind(this);
        this.onSelectionChangeBound = this.onSelectionChange.bind(this);

        this.doc.addEventListener('click', this.onClickHandlerBound);
        this.doc.addEventListener('keydown', this.onKeyDownHandlerBound);
        this.doc.addEventListener('selectionchange', this.onSelectionChangeBound);

        this.pickOutServiceSubscription = this.pickOutService.subscribe((e) => {
            if (e instanceof StartPickOut) {
                this.isMouseSelection = true;

                this.wallApi.core.disableMediaInteraction();
            }

            if (e instanceof PickOutItems) {
                this.wallApi.core.selectBricks(e.ids);
            }

            if (e instanceof EndPickOut) {
                this.wallApi.core.enableMediaInteraction();
            }
        });

        this.towServiceSubscription = this.towService.subscribe((e) => {
            if (e instanceof StartWorkingEvent) {
                this.pickOutService.disablePickOut();

                this.pickOutService.stopPickOut();
            }

            if (e instanceof StopWorkingEvent) {
                this.pickOutService.enablePickOut();
            }

            if (e instanceof DropEvent) {
                let movedBrickIds = [];

                const selectedBrickIds = this.wallApi.core.getSelectedBrickIds();

                if (selectedBrickIds.length > 1) {
                    movedBrickIds = movedBrickIds.concat(selectedBrickIds);
                } else {
                    movedBrickIds.push(e.targetId);
                }

                if (e.dropType === TOW.dropTypes.horizontal) {
                    if (e.dropSide === TOW.dropSides.top) {
                        this.wallApi.core.moveBrickBeforeBrickId(movedBrickIds, e.beforeId);
                    }

                    if (e.dropSide === TOW.dropSides.bottom) {
                        this.wallApi.core.moveBrickAfterBrickId(movedBrickIds, e.beforeId);
                    }
                }

                if (e.dropType === TOW.dropTypes.vertical) {
                    if (e.dropSide === TOW.dropSides.left) {
                        this.wallApi.core.moveBrickToNewColumn(movedBrickIds, e.beforeId, TOW.dropSides.left);
                    }

                    if (e.dropSide === TOW.dropSides.right) {
                        this.wallApi.core.moveBrickToNewColumn(movedBrickIds, e.beforeId, TOW.dropSides.right);
                    }
                }
            }
        });
    }

    onClickHandler() {
        if (this.isMouseSelection) {
            this.isMouseSelection = false;
        } else {
            this.wallApi.core.unSelectBricks();
        }
    }

    onKeyDownHandler(e) {
        const selectedBrickIds = this.wallApi.core.getSelectedBrickIds();
        const firstSelectedBrickId = selectedBrickIds[0];
        const lastSelectedBrickId = selectedBrickIds[selectedBrickIds.length - 1];

        if (e.key === 'Delete' && selectedBrickIds.length) {
            e.preventDefault();

            this.wallApi.core.unSelectBricks();

            this.wallApi.core.removeBricks(selectedBrickIds);
        }

        if (e.key === 'Enter' && selectedBrickIds.length) {
            e.preventDefault();

            this.wallApi.core.focusOnBrickId(firstSelectedBrickId);

            this.wallApi.core.unSelectBricks();
        }

        if (e.key === 'ArrowUp' && selectedBrickIds.length) {
            e.preventDefault();

            const previousBrickId = this.wallApi.core.getPreviousBrickId(lastSelectedBrickId);

            if (previousBrickId) {
                if (e.shiftKey) {
                    if (selectedBrickIds.length > 1 && this.isDownSelectionDirection()) {
                        this.wallApi.core.removeBrickFromSelection(lastSelectedBrickId);
                    } else {
                        this.wallApi.core.addBrickToSelection(previousBrickId);
                    }
                } else {
                    this.wallApi.core.selectBrick(previousBrickId);
                }
            }
        }

        if (e.key === 'ArrowDown' && selectedBrickIds.length) {
            e.preventDefault();

            const nextBrickId = this.wallApi.core.getNextBrickId(lastSelectedBrickId);

            if (nextBrickId) {
                if (e.shiftKey) {
                    if (selectedBrickIds.length > 1 && !this.isDownSelectionDirection()) {
                        this.wallApi.core.removeBrickFromSelection(lastSelectedBrickId);
                    } else {
                        this.wallApi.core.addBrickToSelection(nextBrickId);
                    }
                } else {
                    this.wallApi.core.selectBrick(nextBrickId);
                }
            }
        }

        if (e.key === 'Escape') {
            e.preventDefault();

            if (selectedBrickIds.length) {
                this.wallApi.core.focusOnBrickId(firstSelectedBrickId);
                this.wallApi.core.unSelectBricks();
            }

            const focusedBrickId = this.wallApi.core.getFocusedBrickId();

            if (focusedBrickId) {
                this.wallApi.core.selectBrick(focusedBrickId);
            }
        }
    }

    onSelectionChange() {
        // selection event triggers when user select some text and then just click by the document
        // we should disable pick out service only when user really starts select something
        const selection = this.doc.getSelection();

        // todo need to find more robust variant
        if (selection.focusNode && selection.focusNode.nodeType === Node.TEXT_NODE) {
            this.pickOutService.stopPickOut();
        }
    }

    destroy() {
        this.doc.removeEventListener('click', this.onClickHandlerBound);
        this.doc.removeEventListener('keydown', this.onKeyDownHandlerBound);
        this.doc.removeEventListener('selectionchange', this.onSelectionChangeBound);

        this.wallApi = null;
        this.pickOutServiceSubscription.unsubscribe();
        this.towServiceSubscription.unsubscribe();
    }

    private isDownSelectionDirection() {
        const selectedBrickIds = this.wallApi.core.getSelectedBrickIds();

        const bricksCount = selectedBrickIds.length;

        const lastBrickId = selectedBrickIds[bricksCount - 1];
        const penultimateBrickId = selectedBrickIds[bricksCount - 2];

        return this.wallApi.core.isBrickAheadOf(penultimateBrickId, lastBrickId);
    }
}