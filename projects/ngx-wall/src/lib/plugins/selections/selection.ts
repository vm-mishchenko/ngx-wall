import {DOCUMENT} from '@angular/common';
import {Injector} from '@angular/core';
import {Subscription} from 'rxjs';
import {Radar} from '../../modules/radar/radar.service';
import {SpotModel} from '../../modules/radar/spot.model';
import {PickOutService} from '../../modules/pick-out/pick-out.service';
import {StartPickOut} from '../../modules/pick-out/events/start-pick-out.event';
import {PickOutItems} from '../../modules/pick-out/events/pick-out-items.event';
import {EndPickOut} from '../../modules/pick-out/events/end-pick-out.event';
import {IWallPlugin} from '../../wall/model/interfaces/wall-plugin.interface';
import {IWallModel} from '../../wall/model/interfaces/wall-model.interface';
import {TowService} from '../../modules/tow/tow.service';
import {TOW} from '../../modules/tow/tow.constant';
import {StopWorkingEvent} from '../../modules/tow/events/stop-working.event';
import {WorkInProgressEvent} from '../../modules/tow/events/work-in-progress.event';
import {StartWorkingEvent} from '../../modules/tow/events/start-working.event';
import {PlaceholderRenderer} from '../../modules/components/placeholder-renderer/placeholder-renderer.service';

export interface ISelectionOptions {
    shouldUnselectBrick: (e: MouseEvent) => boolean;
}

export class SelectionPlugin implements IWallPlugin {
    name: 'selection';
    version: '0.0.0';

    doc: Document;

    isMouseSelection = false;
    onMouseDownBound: any;
    onKeyDownHandlerBound: any;

    wallModel: IWallModel;

    private pickOutService: PickOutService;
    private radar: Radar;
    private towService: TowService;
    private placeholderRenderer: PlaceholderRenderer;

    private nearestBrickToDrop: {
        spot: SpotModel;
        type: string;
        side: string;
    };
    private placeholderHeight = 2;
    private isEnableDropZoneHighlight = false;

    private towServiceSubscription: Subscription;
    private pickOutServiceSubscription: Subscription;

    private options: ISelectionOptions;

    constructor(private injector: Injector, options?: ISelectionOptions) {
        // extension point for client to prevent brick un-selections
        this.options = {
            shouldUnselectBrick: () => true,
            ...options
        };
    }

    onWallInitialize(wallModel: IWallModel) {
        this.wallModel = wallModel;

        this.doc = this.injector.get(DOCUMENT);
        this.pickOutService = this.injector.get(PickOutService);
        this.radar = this.injector.get(Radar);
        this.placeholderRenderer = this.injector.get(PlaceholderRenderer);
        this.towService = this.injector.get(TowService);

        this.onMouseDownBound = this.onMouseDown.bind(this);
        this.onKeyDownHandlerBound = this.onKeyDownHandler.bind(this);

        this.doc.addEventListener('mousedown', this.onMouseDownBound);
        this.doc.addEventListener('keydown', this.onKeyDownHandlerBound);

        // listen to picked out items and select appropriate bricks
        this.pickOutServiceSubscription = this.pickOutService.subscribe((e) => {
            if (e instanceof StartPickOut) {
                this.isMouseSelection = true;

                this.wallModel.api.ui.disableMediaInteraction();
            }

            if (e instanceof PickOutItems) {
                this.wallModel.api.ui.selectBricks(e.ids);
            }

            if (e instanceof EndPickOut) {
                this.wallModel.api.ui.enableMediaInteraction();
            }
        });

        // listen for draggable operation and move bricks accordingly
        this.towServiceSubscription = this.towService.subscribe((e) => {
            if (e instanceof StartWorkingEvent) {
                if (this.wallModel.api.core.getBrickSnapshot(e.slaveId)) {
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

                    const selectedBrickIds = this.wallModel.api.ui.getSelectedBrickIds();

                    if (selectedBrickIds.length > 1) {
                        movedBrickIds = movedBrickIds.concat(selectedBrickIds);
                    } else {
                        movedBrickIds.push(e.slaveId);
                    }

                    if (this.nearestBrickToDrop.type === TOW.dropTypes.horizontal) {
                        if (this.nearestBrickToDrop.side === TOW.dropSides.top) {
                            this.wallModel.api.core.moveBrickBeforeBrickId(
                                movedBrickIds,
                                this.nearestBrickToDrop.spot.data.brickId
                            );
                        }

                        if (this.nearestBrickToDrop.side === TOW.dropSides.bottom) {
                            this.wallModel.api.core.moveBrickAfterBrickId(
                                movedBrickIds, this.nearestBrickToDrop.spot.data.brickId
                            );
                        }
                    }

                    if (this.nearestBrickToDrop.type === TOW.dropTypes.vertical) {
                        if (this.nearestBrickToDrop.side === TOW.dropSides.left) {
                            this.wallModel.api.core.moveBrickToNewColumn(
                                movedBrickIds, this.nearestBrickToDrop.spot.data.brickId, TOW.dropSides.left
                            );
                        }

                        if (this.nearestBrickToDrop.side === TOW.dropSides.right) {
                            this.wallModel.api.core.moveBrickToNewColumn(
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
                                e.mousePosition.clientX,
                                e.mousePosition.clientY
                            );

                            const nearestSpotMinimalDistance = nearestSpot.getMinimalDistanceToPoint(
                                e.mousePosition.clientX,
                                e.mousePosition.clientY
                            );

                            if (currentSpotMinimalDistance < nearestSpotMinimalDistance) {
                                nearestSpot = spot;
                            }
                        }
                    });

                    if (nearestSpot) {
                        const nearestSpotMinimalDistance = nearestSpot.getMinimalDistanceToPoint(
                            e.mousePosition.clientX,
                            e.mousePosition.clientY
                        );

                        if (nearestSpotMinimalDistance < 50) {
                            this.nearestBrickToDrop = {
                                spot: nearestSpot,
                                side: null,
                                type: null
                            };

                            if (e.mousePosition.clientX < nearestSpot.position.x) {
                                this.nearestBrickToDrop.type = TOW.dropTypes.vertical;
                                this.nearestBrickToDrop.side = TOW.dropSides.left;
                            }

                            if (e.mousePosition.clientX > nearestSpot.position.x + nearestSpot.size.width) {
                                this.nearestBrickToDrop.type = TOW.dropTypes.vertical;
                                this.nearestBrickToDrop.side = TOW.dropSides.right;
                            }

                            if (e.mousePosition.clientX > nearestSpot.position.x &&
                                e.mousePosition.clientX < nearestSpot.position.x + nearestSpot.size.width) {
                                this.nearestBrickToDrop.type = TOW.dropTypes.horizontal;

                                const centerYPosition = nearestSpot.position.y + (nearestSpot.size.height / 2);

                                this.nearestBrickToDrop.side = e.mousePosition.clientY < centerYPosition ?
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
        if (!this.isMouseOverDraggableBox(e.clientX, e.clientY) && this.options.shouldUnselectBrick(e)) {
            this.wallModel.api.ui.unSelectBricks();
        }
    }

    onKeyDownHandler(e: KeyboardEvent) {
        const selectedBrickIds = this.wallModel.api.ui.getSelectedBrickIds();
        const firstSelectedBrickId = selectedBrickIds[0];
        const lastSelectedBrickId = selectedBrickIds[selectedBrickIds.length - 1];

        if (e.key === 'Delete' && selectedBrickIds.length) {
            e.preventDefault();

            this.wallModel.api.ui.unSelectBricks();

            this.wallModel.api.ui.removeBricks(selectedBrickIds);
        }

        if (e.key === 'Enter' && selectedBrickIds.length) {
            e.preventDefault();

            this.wallModel.api.ui.focusOnBrickId(firstSelectedBrickId);

            this.wallModel.api.ui.unSelectBricks();
        }

        if (e.key === 'ArrowUp' && selectedBrickIds.length) {
            e.preventDefault();

            const previousBrickId = this.wallModel.api.core.getPreviousBrickId(lastSelectedBrickId);

            if (previousBrickId) {
                if (e.shiftKey) {
                    if (selectedBrickIds.length > 1 && this.isDownSelectionDirection()) {
                        this.wallModel.api.ui.removeBrickFromSelection(lastSelectedBrickId);
                    } else {
                        this.wallModel.api.ui.addBrickToSelection(previousBrickId);
                    }
                } else {
                    this.wallModel.api.ui.selectBrick(previousBrickId);
                }
            }
        }

        if (e.key === 'ArrowDown' && selectedBrickIds.length) {
            e.preventDefault();

            const nextBrickId = this.wallModel.api.core.getNextBrickId(lastSelectedBrickId);

            if (nextBrickId) {
                if (e.shiftKey) {
                    if (selectedBrickIds.length > 1 && !this.isDownSelectionDirection()) {
                        this.wallModel.api.ui.removeBrickFromSelection(lastSelectedBrickId);
                    } else {
                        this.wallModel.api.ui.addBrickToSelection(nextBrickId);
                    }
                } else {
                    this.wallModel.api.ui.selectBrick(nextBrickId);
                }
            }
        }

        if (e.key === 'Escape') {
            e.preventDefault();

            if (selectedBrickIds.length) {
                this.wallModel.api.ui.unSelectBricks();
            }
        }
    }

    onWallPluginDestroy() {
        this.doc.removeEventListener('mousedown', this.onMouseDownBound);
        this.doc.removeEventListener('keydown', this.onKeyDownHandlerBound);

        this.wallModel = null;
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
        const selectedBrickIds = this.wallModel.api.ui.getSelectedBrickIds();

        const bricksCount = selectedBrickIds.length;

        const lastBrickId = selectedBrickIds[bricksCount - 1];
        const penultimateBrickId = selectedBrickIds[bricksCount - 2];

        return this.wallModel.api.core.isBrickAheadOf(penultimateBrickId, lastBrickId);
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
                placeholderY = spot.position.y - this.placeholderHeight;
            }

            if (side === TOW.dropSides.bottom) {
                placeholderY = spot.position.y + spot.size.height;
            }

            placeholderIsHorizontal = true;
        }

        if (type === TOW.dropTypes.vertical) {
            placeholderY = spot.position.y;
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
