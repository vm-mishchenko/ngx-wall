import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { EndPickOut, PickOutItems, PickOutService, StartPickOut } from '../../../modules/pick-out';
import { Radar, SpotModel } from '../../../modules/radar';
import { StartWorkingEvent, StopWorkingEvent, TOW, TowService } from '../../../modules/tow';
import { WorkInProgressEvent } from '../../../modules/tow/events/work-in-progress.event';
import { PlaceholderRenderer } from '../../components/placeholder-renderer/placeholder-renderer.service';
import { WallApi } from '../../components/wall';
import { IPluginDestroy } from '../../wall.interfaces';

@Injectable()
export class SelectionPlugin implements IPluginDestroy { // todo should implement plugin interface
    doc: Document;

    isMouseSelection: boolean = false;
    onMouseDownBound: any;
    onKeyDownHandlerBound: any;

    private nearestBrickToDrop: {
        spot: SpotModel;
        type: string;
        side: string;
    };
    private placeholderHeight = 2;
    private currentYScrollPosition: number;
    private isEnableDropZoneHighlight: boolean = false;

    private towServiceSubscription: Subscription;
    private pickOutServiceSubscription: Subscription;

    constructor(private wallApi: WallApi,
                private pickOutService: PickOutService,
                private radar: Radar,
                private placeholderRenderer: PlaceholderRenderer,
                private towService: TowService,
                @Inject(DOCUMENT) doc) {
        this.doc = doc;

        this.currentYScrollPosition = window.pageYOffset;

        window.addEventListener('scroll', () => {
            this.placeholderRenderer.clear();

            this.currentYScrollPosition = window.pageYOffset;
        });

        this.onMouseDownBound = this.onMouseDown.bind(this);
        this.onKeyDownHandlerBound = this.onKeyDownHandler.bind(this);

        this.doc.addEventListener('mousedown', this.onMouseDownBound);
        this.doc.addEventListener('keydown', this.onKeyDownHandlerBound);

        // listen to picked out items and select appropriate bricks
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

        // listen for draggable operation and move bricks accordingly
        this.towServiceSubscription = this.towService.subscribe((e) => {
            if (e instanceof StartWorkingEvent) {
                if (this.wallApi.core.getBrickSnapshot(e.slaveId)) {
                    this.isEnableDropZoneHighlight = true;
                } else {
                    this.isEnableDropZoneHighlight = false;
                }

                this.nearestBrickToDrop = null;
                this.placeholderRenderer.clear();
            }

            if (e instanceof StopWorkingEvent && this.nearestBrickToDrop) {
                if (this.isEnableDropZoneHighlight) {
                    let movedBrickIds = [];

                    const selectedBrickIds = this.wallApi.core.getSelectedBrickIds();

                    if (selectedBrickIds.length > 1) {
                        movedBrickIds = movedBrickIds.concat(selectedBrickIds);
                    } else {
                        movedBrickIds.push(e.slaveId);
                    }

                    if (this.nearestBrickToDrop.type === TOW.dropTypes.horizontal) {
                        if (this.nearestBrickToDrop.side === TOW.dropSides.top) {
                            this.wallApi.core.moveBrickBeforeBrickId(
                                movedBrickIds,
                                this.nearestBrickToDrop.spot.data.brickId
                            );
                        }

                        if (this.nearestBrickToDrop.side === TOW.dropSides.bottom) {
                            this.wallApi.core.moveBrickAfterBrickId(
                                movedBrickIds, this.nearestBrickToDrop.spot.data.brickId
                            );
                        }
                    }

                    if (this.nearestBrickToDrop.type === TOW.dropTypes.vertical) {
                        if (this.nearestBrickToDrop.side === TOW.dropSides.left) {
                            this.wallApi.core.moveBrickToNewColumn(
                                movedBrickIds, this.nearestBrickToDrop.spot.data.brickId, TOW.dropSides.left
                            );
                        }

                        if (this.nearestBrickToDrop.side === TOW.dropSides.right) {
                            this.wallApi.core.moveBrickToNewColumn(
                                movedBrickIds, this.nearestBrickToDrop.spot.data.brickId, TOW.dropSides.right
                            );
                        }
                    }

                    this.nearestBrickToDrop = null;

                    this.placeholderRenderer.clear();
                }
            }

            if (e instanceof WorkInProgressEvent) {
                if (this.isEnableDropZoneHighlight) {
                    const spots = this.radar.filterSpots((spot: SpotModel) => spot.data.isBeacon);

                    let nearestSpot: SpotModel;

                    spots.forEach((spot) => {
                        spot.updateInfo();

                        if (!nearestSpot) {
                            nearestSpot = spot;
                        } else {
                            const currentSpotMinimalDistance = spot.getMinimalDistanceToPoint(
                                e.mousePosition.xViewportPosition,
                                e.mousePosition.yPosition
                            );

                            const nearestSpotMinimalDistance = nearestSpot.getMinimalDistanceToPoint(
                                e.mousePosition.xViewportPosition,
                                e.mousePosition.yPosition
                            );

                            if (currentSpotMinimalDistance < nearestSpotMinimalDistance) {
                                nearestSpot = spot;
                            }
                        }
                    });

                    if (nearestSpot) {
                        const nearestSpotMinimalDistance = nearestSpot.getMinimalDistanceToPoint(
                            e.mousePosition.xViewportPosition,
                            e.mousePosition.yPosition
                        );

                        if (nearestSpotMinimalDistance < 50) {
                            this.nearestBrickToDrop = {
                                spot: nearestSpot,
                                side: null,
                                type: null
                            };

                            if (e.mousePosition.xViewportPosition < nearestSpot.position.x) {
                                this.nearestBrickToDrop.type = TOW.dropTypes.vertical;
                                this.nearestBrickToDrop.side = TOW.dropSides.left;
                            }

                            if (e.mousePosition.xViewportPosition > nearestSpot.position.x + nearestSpot.size.width) {
                                this.nearestBrickToDrop.type = TOW.dropTypes.vertical;
                                this.nearestBrickToDrop.side = TOW.dropSides.right;
                            }

                            if (e.mousePosition.xViewportPosition > nearestSpot.position.x &&
                                e.mousePosition.xViewportPosition < nearestSpot.position.x + nearestSpot.size.width) {
                                this.nearestBrickToDrop.type = TOW.dropTypes.horizontal;

                                const centerYPosition = nearestSpot.position.y + (nearestSpot.size.height / 2);

                                this.nearestBrickToDrop.side = e.mousePosition.yViewportPosition < centerYPosition ?
                                    TOW.dropSides.top : TOW.dropSides.bottom;
                            }

                            this.renderPlaceholder();
                        } else {
                            this.nearestBrickToDrop = null;

                            this.placeholderRenderer.clear();
                        }
                    } else {
                        this.nearestBrickToDrop = null;

                        this.placeholderRenderer.clear();
                    }
                }
            }
        });
    }

    onMouseDown(e: MouseEvent) {
        if (!this.isMouseOverDraggableBox(e.clientX, e.clientY)) {
            this.wallApi.core.unSelectBricks();
        }
    }

    onKeyDownHandler(e: KeyboardEvent) {
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
                this.wallApi.core.unSelectBricks();
            }
        }
    }

    onPluginDestroy() {
        this.doc.removeEventListener('mousedown', this.onMouseDownBound);
        this.doc.removeEventListener('keydown', this.onKeyDownHandlerBound);

        this.wallApi = null;
        this.pickOutServiceSubscription.unsubscribe();
        this.towServiceSubscription.unsubscribe();
    }

    private isMouseOverDraggableBox(clientX: number, clientY: number): boolean {
        let currentElement = document.elementFromPoint(clientX, clientY);

        while (currentElement && !currentElement.classList.contains('wall-canvas-brick__draggable-box')) {
            currentElement = currentElement.parentElement;
        }

        return Boolean(currentElement);
    }

    private isDownSelectionDirection(): boolean {
        const selectedBrickIds = this.wallApi.core.getSelectedBrickIds();

        const bricksCount = selectedBrickIds.length;

        const lastBrickId = selectedBrickIds[bricksCount - 1];
        const penultimateBrickId = selectedBrickIds[bricksCount - 2];

        return this.wallApi.core.isBrickAheadOf(penultimateBrickId, lastBrickId);
    }

    private renderPlaceholder() {
        let placeholderX;
        let placeholderY;
        let placeholderSize;
        let placeholderIsHorizontal;

        const spot = this.nearestBrickToDrop.spot;
        const side = this.nearestBrickToDrop.side;
        const type = this.nearestBrickToDrop.type;

        if (type === TOW.dropTypes.horizontal) {
            placeholderX = spot.position.x;
            placeholderSize = spot.size.width;

            if (side === TOW.dropSides.top) {
                placeholderY = spot.position.y - this.currentYScrollPosition - this.placeholderHeight;
            }

            if (side === TOW.dropSides.bottom) {
                placeholderY = spot.position.y + spot.size.height - this.currentYScrollPosition;
            }

            placeholderIsHorizontal = true;
        }

        if (type === TOW.dropTypes.vertical) {
            placeholderY = spot.position.y - this.currentYScrollPosition;
            placeholderSize = spot.size.height;
            placeholderIsHorizontal = false;

            if (side === TOW.dropSides.left) {
                placeholderX = spot.position.x;
            }

            if (side === TOW.dropSides.right) {
                placeholderX = spot.position.x + spot.size.width;
            }
        }

        this.placeholderRenderer.render(placeholderX, placeholderY, placeholderSize, placeholderIsHorizontal);
    }
}
