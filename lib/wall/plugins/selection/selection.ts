import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { WallApi } from '../../components/wall/wall-api.service';
import { EndPickOut, PickOutItems, PickOutService, StartPickOut } from '../../../modules/pick-out';
import { DropEvent, StartWorkingEvent, StopWorkingEvent, TOW, TowService } from '../../../modules/tow';

@Injectable()
export class SelectionPlugin {
    doc: any = null;

    isMouseSelection: boolean = false;

    constructor(private wallApi: WallApi,
                private pickOutService: PickOutService,
                private towService: TowService,
                @Inject(DOCUMENT) doc) {
        this.doc = doc;

        this.initialize();
    }

    initialize() {
        this.doc.addEventListener('click', () => {
            if (this.isMouseSelection) {
                this.isMouseSelection = false;
            } else {
                this.wallApi.core.unSelectBricks();
            }
        });

        this.doc.addEventListener('keydown', (e) => {
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
        });

        this.doc.addEventListener('selectionchange', () => {
            // selection event triggers when user select some text and then just click by the document
            // we should disabele pick out service only when user really starts select something
            const selection = this.doc.getSelection();

            // todo need to find more robust variant
            if (selection.focusNode && selection.focusNode.nodeType === Node.TEXT_NODE) {
                this.pickOutService.stopPickOut();
            }
        });

        this.pickOutService.subscribe((e) => {
            if (e instanceof PickOutItems) {
                this.wallApi.core.selectBricks(e.ids);
            }

            if (e instanceof StartPickOut) {
                this.isMouseSelection = true;

                const selection = this.doc.getSelection();

                // todo need to find more robust variant
                if (selection.focusNode && selection.focusNode.nodeType === Node.TEXT_NODE) {
                    this.pickOutService.stopPickOut();

                    this.isMouseSelection = false;
                }
            }

            if (e instanceof EndPickOut) {
            }
        });

        this.towService.subscribe((e) => {
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

    private isDownSelectionDirection() {
        const selectedBrickIds = this.wallApi.core.getSelectedBrickIds();

        const bricksCount = selectedBrickIds.length;

        const lastBrickId = selectedBrickIds[bricksCount - 1];
        const penultimateBrickId = selectedBrickIds[bricksCount - 2];

        return this.wallApi.core.isBrickAheadOf(penultimateBrickId, lastBrickId);
    }


}