import {DOCUMENT} from '@angular/common';
import {Injector} from '@angular/core';

import * as Mousetrap from 'mousetrap';
import {fromEvent, Observable, Subject, Subscription} from 'rxjs';
import {filter, takeUntil, withLatestFrom} from 'rxjs/operators';
import {PlaceholderRenderer} from '../../modules/components/placeholder-renderer/placeholder-renderer.service';
import {PickOutService} from '../../modules/pick-out/pick-out.service';
import {Radar} from '../../modules/radar/radar.service';
import {SpotModel} from '../../modules/radar/spot.model';
import {StartWorkingEvent} from '../../modules/tow/events/start-working.event';
import {StopWorkingEvent} from '../../modules/tow/events/stop-working.event';
import {WorkInProgressEvent} from '../../modules/tow/events/work-in-progress.event';
import {TOW} from '../../modules/tow/tow.constant';
import {TowService} from '../../modules/tow/tow.service';
import {IWallUiApi} from '../../wall/components/wall/interfaces/ui-api.interface';
import {VIEW_MODE, WALL_VIEW_API} from '../../wall/components/wall/wall-view.model';
import {IWallModel} from '../../wall/model/interfaces/wall-model.interface';
import {IWallPlugin} from '../../wall/model/interfaces/wall-plugin.interface';

export interface ISelectionOptions {
    shouldUnselectBrick: (e: MouseEvent) => boolean;
}

function observeKey(key) {
    const subject = new Subject<KeyboardEvent>();

    Mousetrap.bind(key, (e) => {
        subject.next(e);
    });

    return subject.asObservable();
}

export class SelectionPlugin implements IWallPlugin {
    name: 'selection';
    version: '0.0.0';

    doc: Document;

    isMouseSelection = false;

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

    private destroyed$ = new Subject();

    private uiApi: IWallUiApi;

    mouseDown$: Observable<MouseEvent>;
    keyDown$: Observable<KeyboardEvent>;
    arrowUp$: Observable<any>;
    arrowDown$: Observable<any>;
    enter$: Observable<any>;
    delete$: Observable<any>;
    escape$: Observable<any>;
    x$: Observable<any>;

    constructor(private injector: Injector, options?: ISelectionOptions) {
        // extension point for client to prevent brick un-selections
        this.options = {
            shouldUnselectBrick: () => true,
            ...options
        };
    }

    onWallInitialize(wallModel: IWallModel) {
        this.wallModel = wallModel;

        this.wallModel.apiRegistered$.pipe(
            filter((apiName) => {
                return apiName === WALL_VIEW_API;
            }),
            // first(),
        ).subscribe(() => {
            this.uiApi = wallModel.api.ui;

            this.doc = this.injector.get(DOCUMENT);
            this.pickOutService = this.injector.get(PickOutService);
            this.radar = this.injector.get(Radar);
            this.placeholderRenderer = this.injector.get(PlaceholderRenderer);
            this.towService = this.injector.get(TowService);

            this.keyDown$ = fromEvent<KeyboardEvent>(this.doc, 'keydown');
            this.mouseDown$ = fromEvent<MouseEvent>(this.doc, 'mousedown');
            this.arrowDown$ = this.keyDown$.pipe(
                filter((event) => {
                    return event.key === 'ArrowDown';
                })
            );

            this.arrowUp$ = this.keyDown$.pipe(
                filter((event) => {
                    return event.key === 'ArrowUp';
                })
            );

            this.enter$ = this.keyDown$.pipe(
                filter((event) => {
                    return event.key === 'Enter';
                })
            );

            this.delete$ = this.keyDown$.pipe(
                filter((event) => {
                    return event.key === 'Delete';
                })
            );

            this.escape$ = this.keyDown$.pipe(
                filter((event) => {
                    return event.key === 'Escape';
                })
            );

            this.x$ = this.keyDown$.pipe(
                filter((event) => {
                    return event.key === 'x';
                })
            );

            this.arrowUp$.pipe(
                takeUntil(this.destroyed$),
                withLatestFrom(this.uiApi.mode.currentMode$),
                filter(([event, currentMode]) => {
                    return currentMode === VIEW_MODE.NAVIGATION;
                })
            ).subscribe(([event, currentMode]) => {
                event.preventDefault();

                if (event.ctrlKey) {
                    this.uiApi.mode.navigation.moveBricksAbove();
                } else {
                    this.uiApi.mode.navigation.moveCursorToPreviousBrick();
                }
            });

            this.arrowDown$.pipe(
                takeUntil(this.destroyed$),
                withLatestFrom(this.uiApi.mode.currentMode$),
                filter(([event, currentMode]) => {
                    return currentMode === VIEW_MODE.NAVIGATION;
                })
            ).subscribe(([event, currentMode]) => {
                event.preventDefault();

                if (event.ctrlKey) {
                    this.uiApi.mode.navigation.moveBricksBelow();
                } else {
                    this.uiApi.mode.navigation.moveCursorToNextBrick();
                }
            });

            this.enter$.pipe(
                takeUntil(this.destroyed$),
                withLatestFrom(this.uiApi.mode.currentMode$),
                filter(([event, currentMode]) => {
                    return currentMode === VIEW_MODE.NAVIGATION;
                })
            ).subscribe(([event, currentMode]) => {
                event.preventDefault();
                this.uiApi.mode.navigation.callBrickPrimaryAction();
            });

            this.delete$.pipe(
                takeUntil(this.destroyed$),
                withLatestFrom(
                    this.uiApi.mode.currentMode$,
                    this.uiApi.mode.navigation.selectedBricks$
                ),
                filter(([event, currentMode, selectedBricks]) => {
                    return currentMode === VIEW_MODE.NAVIGATION;
                })
            ).subscribe(([event, currentMode, selectedBricks]) => {
                event.preventDefault();

                let removeBrickIds;

                if (Boolean(selectedBricks.length)) {
                    removeBrickIds = selectedBricks;
                } else {
                    removeBrickIds = [this.uiApi.mode.navigation.cursorPosition];
                }

                this.wallModel.api.core2.removeBricks(removeBrickIds);
            });

            this.escape$.pipe(
                takeUntil(this.destroyed$),
            ).subscribe((event) => {
                event.preventDefault();
                this.uiApi.mode.switchMode();
            });

            // listen to picked out items and select appropriate bricks
            this.pickOutService.startPickOut$
                .pipe(
                    takeUntil(this.destroyed$)
                ).subscribe(() => {
                this.isMouseSelection = true;
                // switch to navigation
                this.uiApi.mode.switchToNavigationMode();
                this.wallModel.api.ui.mediaInteraction.disable();
            });

            this.pickOutService.endPickOut$
                .pipe(
                    takeUntil(this.destroyed$)
                ).subscribe(() => {
                this.wallModel.api.ui.mediaInteraction.enable();
            });

            this.pickOutService.pickOut$
                .pipe(
                    takeUntil(this.destroyed$)
                ).subscribe((brickIds) => {
                this.uiApi.mode.navigation.selectBricks(brickIds);
            });

            this.x$.pipe(
                takeUntil(this.destroyed$),
                withLatestFrom(this.uiApi.mode.currentMode$),
                filter(([event, currentMode]) => {
                    return currentMode === VIEW_MODE.NAVIGATION;
                })
            ).subscribe(([event, currentMode]) => {
                event.preventDefault();
                this.uiApi.mode.navigation.switchBrickSelection();
            });

            this.mouseDown$.pipe(
                takeUntil(this.destroyed$),
                withLatestFrom(this.uiApi.mode.currentMode$),
                filter(([event, currentMode]) => {
                    return currentMode === VIEW_MODE.NAVIGATION;
                }),
                filter(([event, currentMode]) => {
                    return !this.isMouseOverDraggableBox(event.clientX, event.clientY) &&
                        this.options.shouldUnselectBrick(event);
                })
            ).subscribe(() => {
                this.uiApi.mode.switchToEditMode();
            });

            // listen for draggable operation and move bricks accordingly
            this.towServiceSubscription = this.towService.subscribe((e) => {
                if (e instanceof StartWorkingEvent) {
                    if (this.wallModel.api.core2.getBrickSnapshot(e.slaveId)) {
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

                        const selectedBrickIds = this.wallModel.api.ui.mode.navigation.getSelectedBrickIds();

                        if (selectedBrickIds.length > 1) {
                            movedBrickIds = movedBrickIds.concat(selectedBrickIds);
                        } else {
                            movedBrickIds.push(e.slaveId);
                        }

                        if (this.nearestBrickToDrop.type === TOW.dropTypes.horizontal) {
                            if (this.nearestBrickToDrop.side === TOW.dropSides.top) {
                                this.wallModel.api.core2.moveBrickBeforeBrickId(
                                    movedBrickIds,
                                    this.nearestBrickToDrop.spot.clientData.brickId
                                );
                            }

                            if (this.nearestBrickToDrop.side === TOW.dropSides.bottom) {
                                this.wallModel.api.core2.moveBrickAfterBrickId(
                                    movedBrickIds, this.nearestBrickToDrop.spot.clientData.brickId
                                );
                            }
                        }

                        this.nearestBrickToDrop = null;

                        this.placeholderRenderer.clear();
                    }
                }

                if (e instanceof WorkInProgressEvent) {
                    if (this.isEnableDropZoneHighlight) {
                        const spots = Array.from(this.radar.spots.values())
                            .filter((spot: SpotModel) => spot.clientData.isBeacon);

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
        });
    }

    onWallPluginDestroy() {
        this.wallModel = null;
        this.pickOutServiceSubscription.unsubscribe();
        this.towServiceSubscription.unsubscribe();

        this.destroyed$.next();
    }

    private isMouseOverDraggableBox(clientX: number, clientY: number): boolean {
        let currentElement = document.elementFromPoint(clientX, clientY);

        while (currentElement && !currentElement.classList.contains('wall-canvas-brick__draggable-box')) {
            currentElement = currentElement.parentElement;
        }

        return Boolean(currentElement);
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

        this.placeholderRenderer.render(placeholderX, placeholderY, placeholderSize, placeholderIsHorizontal);
    }
}
