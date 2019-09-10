import {IWallDefinition} from './interfaces/wall-definition.interface';
import {AddBrickEvent, IBrickSnapshot, IWallModel} from '../wall';
import {BrickRegistry} from '../registry/brick-registry.service';
import {WallModelFactory} from '../factory/wall-model.factory';

function generateTwoColumnWithOneBrick(wm) {
    wm.api.core.addDefaultBrick();
    wm.api.core.addDefaultBrick();

    const brickIds = wm.api.core.getBrickIds();

    // todo: replace to CONSTANT
    // there will be 1 row and 2 columns
    const side = 'right';
    wm.api.core.moveBrickToNewColumn([brickIds[1]], brickIds[0], side);
}

describe('Wall Model', () => {
    const brickRegistry = new BrickRegistry();
    const wallModelFactory = new WallModelFactory(brickRegistry);

    const textRepresentation = 'TextBrickTextRepresentation';

    const defaultPlan: IWallDefinition = {
        bricks: [],
        layout: {
            bricks: []
        }
    };

    const simplePlan: IWallDefinition = {
        bricks: [
            {
                id: '1',
                tag: 'text',
                data: {},
                meta: {}
            }
        ],
        layout: {
            bricks: [
                {
                    id: '2',
                    columns: [
                        {
                            bricks: [
                                {
                                    id: '1'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };

    const twoColumnPlan: IWallDefinition = {
        bricks: [
            {
                id: '1',
                tag: 'text',
                data: {},
                meta: {}
            },
            {
                id: '2',
                tag: 'text',
                data: {},
                meta: {}
            }
        ],
        layout: {
            bricks: [
                {
                    id: '2',
                    columns: [
                        {
                            bricks: [
                                {
                                    id: '1'
                                }
                            ]
                        },
                        {
                            bricks: [
                                {
                                    id: '2'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };

    const twoColumnWithFewBricksInColumnPlan: IWallDefinition = {
        bricks: [
            {
                id: '1',
                tag: 'text',
                data: {},
                meta: {}
            },
            {
                id: '2',
                tag: 'text',
                data: {},
                meta: {}
            },
            {
                id: '3',
                tag: 'text',
                data: {},
                meta: {}
            }
        ],
        layout: {
            bricks: [
                {
                    id: '2',
                    columns: [
                        {
                            bricks: [
                                {
                                    id: '1'
                                }
                            ]
                        },
                        {
                            bricks: [
                                {
                                    id: '2'
                                },
                                {
                                    id: '3'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };

    beforeAll(() => {
        class TextBrickTextRepresentation {
            constructor(private brickSnapshot: IBrickSnapshot) {
            }

            getText() {
                return textRepresentation;
            }
        }

        brickRegistry.register({
            tag: 'text',
            name: 'FAKE',
            description: 'FAKE',
            component: 'FAKE',
            supportText: true,
            textRepresentation: TextBrickTextRepresentation,
            destructor: () => {
                return Promise.resolve();
            }
        });

        brickRegistry.register({
            tag: 'header',
            name: 'FAKE',
            description: 'FAKE',
            component: 'FAKE'
        });
    });

    it('should be defined', () => {
        const wm = wallModelFactory.create({plan: defaultPlan});

        expect(wm).toBeDefined();
    });

    describe('[Initialization]', () => {
        it('should initialize different plans', () => {
            [
                defaultPlan,
                simplePlan,
                twoColumnPlan,
                twoColumnWithFewBricksInColumnPlan
            ].forEach((plan) => {
                const wm = wallModelFactory.create({plan});

                expect(wm.api.core.getPlan()).toEqual(plan);
            });
        });
    });

    describe('[Sort]', () => {
        it('should sort brick id by layout order', () => {
            const plan: IWallDefinition = {
                bricks: [
                    {
                        id: '1',
                        tag: 'text',
                        data: {},
                        meta: {}
                    },
                    {
                        id: '2',
                        tag: 'text',
                        data: {},
                        meta: {}
                    },
                    {
                        id: '3',
                        tag: 'text',
                        data: {},
                        meta: {}
                    }
                ],
                layout: {
                    bricks: [
                        {
                            id: '2',
                            columns: [
                                {
                                    bricks: [
                                        {
                                            id: '1'
                                        },
                                        {
                                            id: '2'
                                        },
                                        {
                                            id: '3'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            };

            const wm = wallModelFactory.create({plan});

            const filteredBrickIds = wm.api.core.sortBrickIdsByLayoutOrder(['2', '3', '1']);

            expect(filteredBrickIds).toEqual(['1', '2', '3']);
        });
    });

    describe('[Query API]', () => {
        it('should contain all query public api', () => {
            const wm = wallModelFactory.create();

            [
                'getRowCount',
                'getBrickTag',
                'getPreviousBrickId',
                'getNextBrickId',
                'getColumnCount',
                'getBrickIds',
                'getBricksCount',
                'getNextTextBrickId',
                'getPreviousTextBrickId',
                'filterBricks',
                'isBrickAheadOf',
                'isRegisteredBrick',
                'subscribe',
                'traverse'
            ].forEach((methodName) => {
                expect(wm.api.core[methodName]).toBeDefined();
            });
        });

        it('getRowCount()', () => {
            const wm = wallModelFactory.create();

            expect(wm.api.core.getRowCount()).toBe(0);

            wm.api.core.addDefaultBrick();

            expect(wm.api.core.getRowCount()).toBe(1);
        });

        it('getColumnCount()', () => {
            const wm = wallModelFactory.create();
            const rowIndex = 0;

            wm.api.core.addDefaultBrick();

            expect(wm.api.core.getColumnCount(rowIndex)).toBe(1);
        });

        it('isBrickAheadOf()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            const brickIds = wm.api.core.getBrickIds();

            expect(wm.api.core.isBrickAheadOf(brickIds[0], brickIds[1])).toBe(true);
        });

        it('getBricksCount()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            expect(wm.api.core.getBricksCount()).toBe(2);
        });

        it('getBrickTag()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();

            expect(wm.api.core.getBrickTag(wm.api.core.getBrickIds()[0])).toBe('text');
        });

        it('getBrickIds()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            expect(wm.api.core.getBrickIds().length).toBe(2);
        });

        it('getNextBrickId()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            const brickIds = wm.api.core.getBrickIds();

            expect(wm.api.core.getNextBrickId(brickIds[0])).toBe(brickIds[1]);
        });

        it('getPreviousBrickId()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            const brickIds = wm.api.core.getBrickIds();

            expect(wm.api.core.getPreviousBrickId(brickIds[1])).toBe(brickIds[0]);
        });

        it('getNextTextBrickId()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            const brickIds = wm.api.core.getBrickIds();

            expect(wm.api.core.getNextTextBrickId(brickIds[0])).toBe(brickIds[1]);
        });

        it('getPreviousTextBrickId()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            const brickIds = wm.api.core.getBrickIds();

            expect(wm.api.core.getPreviousTextBrickId(brickIds[1])).toBe(brickIds[0]);
        });

        it('filterBricks()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();

            const brickIds = wm.api.core.getBrickIds();

            wm.api.core.addBrickAfterBrickId(brickIds[0], 'img');

            const filteredBricks = wm.api.core.filterBricks((brick: IBrickSnapshot) => brick.tag === 'img');

            expect(filteredBricks.length).toBe(1);
            expect(filteredBricks[0].tag).toBe('img');
        });

        it('isRegisteredBrick()', () => {
            const wm = wallModelFactory.create();

            expect(wm.api.core.isRegisteredBrick('text')).toBe(true);
            expect(wm.api.core.isRegisteredBrick('header')).toBe(true);
            expect(wm.api.core.isRegisteredBrick('img')).toBe(false);
        });

        it('subscribe()', () => {
            const wm = wallModelFactory.create();

            let event;

            wm.api.core.subscribe((event_) => {
                event = event_;
            });

            wm.api.core.addDefaultBrick();

            expect(event).toBeDefined();
            expect(event instanceof AddBrickEvent).toBeTruthy();
            expect(event.brickId).toBeDefined();
        });

        it('traverse()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            let i = 0;

            const brickIds = wm.api.core.getBrickIds();

            wm.api.core.traverse((row) => {
                expect(row.columns[0].bricks[0].id).toBe(brickIds[i]);
                i++;
            });
        });

        describe('getBrickTextRepresentation()', () => {
            it('should use brick text represntation', () => {
                const wm = wallModelFactory.create();

                wm.api.core.addDefaultBrick();

                const brickTextRepresentation = wm.api.core.getBrickTextRepresentation(wm.api.core.getBrickIds()[0]);

                expect(brickTextRepresentation).toBe(textRepresentation);
            });

            it('should support default text representation', () => {
                const wm = wallModelFactory.create();

                wm.api.core.addDefaultBrick();

                const textBrickSpecification = brickRegistry.get('text');

                const originalTextRepresentation = textBrickSpecification.textRepresentation;

                delete textBrickSpecification.textRepresentation;

                const brickTextRepresentation = wm.api.core.getBrickTextRepresentation(wm.api.core.getBrickIds()[0]);

                expect(brickTextRepresentation).toBe('');

                textBrickSpecification.textRepresentation = originalTextRepresentation;
            });
        });
    });

    describe('[Command API]', () => {
        it('should contain all command public api', () => {
            const wm = wallModelFactory.create();

            [
                'setPlan',
                'addBrickAfterBrickId',
                'updateBrickState',
                'turnBrickInto',
                'addBrickAtStart',
                'addDefaultBrick',
                'moveBrickAfterBrickId',
                'moveBrickBeforeBrickId',
                'moveBrickToNewColumn',
                'removeBrick',
                'removeBricks',
                'clear'
            ].forEach((methodName) => {
                expect(wm.api.core[methodName]).toBeDefined();
            });
        });

        it('setPlan()', () => {
            const wm = wallModelFactory.create({plan: defaultPlan});

            wm.api.core.setPlan(simplePlan);

            expect(wm.api.core.getPlan()).toEqual(simplePlan);
        });

        it('addBrickAtStart()', () => {
            const wm = wallModelFactory.create();
            const brickState = {text: 'predefined state'};

            wm.api.core.addDefaultBrick();
            wm.api.core.addBrickAtStart('text', brickState);

            const firstBrick = wm.api.core.getBrickSnapshot(wm.api.core.getBrickIds()[0]);

            expect(firstBrick.tag).toBe('text');
            expect(firstBrick.state.text).toBe(brickState.text);
        });

        describe('addBrickAfterBrickId()', () => {
            it('should add in new row', () => {
                // If there is only one column in the row then
                // new brick will be added in the new row after defined brick id
                const wm = wallModelFactory.create();

                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();

                const brickIds = wm.api.core.getBrickIds();

                wm.api.core.addBrickAfterBrickId(brickIds[0], 'header', {text: 'header'});

                const expectedBrickSnapshot = wm.api.core.getBrickSnapshot(wm.api.core.getBrickIds()[1]);

                // check that brick was added to right position
                expect(expectedBrickSnapshot.tag).toBe('header');
                expect(expectedBrickSnapshot.state.text).toBe('header');
                expect(wm.api.core.getRowCount()).toBe(3);
            });

            it('should add in same column', () => {
                // If there is only one column in the row then
                // new brick will be added in the new row after defined brick id
                const wm = wallModelFactory.create();

                generateTwoColumnWithOneBrick(wm);

                const brickIds = wm.api.core.getBrickIds();

                wm.api.core.addBrickAfterBrickId(brickIds[1], 'header', {text: 'header'});

                const expectedBrickSnapshot = wm.api.core.getBrickSnapshot(wm.api.core.getBrickIds()[2]);

                // check that brick was added to right position
                expect(expectedBrickSnapshot.tag).toBe('header');
                expect(expectedBrickSnapshot.state.text).toBe('header');
                expect(wm.api.core.getRowCount()).toBe(1);
            });
        });

        describe('addBrickBeforeBrickId', () => {
            it('should add to new row', () => {
                const wm = wallModelFactory.create();

                wm.api.core.addDefaultBrick();

                const brickIds = wm.api.core.getBrickIds();

                wm.api.core.addBrickBeforeBrickId(brickIds[0], 'header', {text: 'header'});

                const expectedBrickSnapshot = wm.api.core.getBrickSnapshot(wm.api.core.getBrickIds()[0]);

                // check that brick was added to right position
                expect(expectedBrickSnapshot.tag).toBe('header');
                expect(expectedBrickSnapshot.state.text).toBe('header');
                expect(wm.api.core.getRowCount()).toBe(2);
            });

            it('should add in the same column', () => {
                const wm = wallModelFactory.create();

                generateTwoColumnWithOneBrick(wm);

                const brickIds = wm.api.core.getBrickIds();

                wm.api.core.addBrickBeforeBrickId(brickIds[1], 'header', {text: 'header'});

                const expectedBrickSnapshot = wm.api.core.getBrickSnapshot(wm.api.core.getBrickIds()[1]);

                // check that brick was added to right position
                expect(expectedBrickSnapshot.tag).toBe('header');
                expect(expectedBrickSnapshot.state.text).toBe('header');
                expect(wm.api.core.getRowCount()).toBe(1);
            });
        });

        it('updateBrickState()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addBrickAtStart('text', {text: 'foo', unchanged: 'foo'});

            const brickId = wm.api.core.getBrickIds()[0];

            wm.api.core.updateBrickState(brickId, {text: 'bar'});

            expect(wm.api.core.getBrickSnapshot(brickId).state.text).toBe('bar');
            expect(wm.api.core.getBrickSnapshot(brickId).state.unchanged).toBe('foo');
        });

        it('turnBrickInto()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();

            const brickId = wm.api.core.getBrickIds()[0];

            wm.api.core.turnBrickInto(brickId, 'header');

            expect(wm.api.core.getBrickSnapshot(brickId).tag).toBe('header');
        });

        it('addDefaultBrick()', () => {
            const wm = wallModelFactory.create();

            expect(wm.api.core.getBrickIds().length).toBe(0);

            wm.api.core.addDefaultBrick();

            const brickIds = wm.api.core.getBrickIds();
            expect(brickIds.length).toBe(1);

            const brick = wm.api.core.getBrickSnapshot(brickIds[0]);
            expect(brick.tag).toBe('text');
        });

        it('removeBrick()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();

            const brickIds = wm.api.core.getBrickIds();

            expect(brickIds.length).toBe(1);

            wm.api.core.removeBrick(brickIds[0]);

            expect(wm.api.core.getBrickIds().length).toBe(0);
        });

        it('removeBricks()', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();
            expect(wm.api.core.getBrickIds().length).toBe(2);

            wm.api.core.removeBricks(wm.api.core.getBrickIds());
            expect(wm.api.core.getBrickIds().length).toBe(0);
        });

        describe('moveBrickAfterBrickId()', () => {
            it('should move bricks to new row', () => {
                // If there is only one column in the row then
                // new brick will be moved in the new row after defined brick id
                const wm = wallModelFactory.create();
                const expectedLayoutStructure: IRowStructure[] = [
                    {
                        columns: [1]
                    },
                    {
                        columns: [1]
                    },
                    {
                        columns: [1]
                    },
                    {
                        columns: [1]
                    },
                    {
                        columns: [1]
                    },
                ];

                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();

                [
                    // simple case - move back item
                    {
                        movedBrickIndexes: [1],  // brick indexes which have to be moved
                        pillarBrickIndexPosition: 0 // index before which bricks have to be moved
                    },
                    // simple case  - move front item
                    {
                        movedBrickIndexes: [0],
                        pillarBrickIndexPosition: 1
                    },
                    // direct order - move back item
                    {
                        movedBrickIndexes: [2, 3, 4],
                        pillarBrickIndexPosition: 0
                    },
                    // reverse order - move back items
                    {
                        movedBrickIndexes: [4, 3, 2],
                        pillarBrickIndexPosition: 0
                    },
                    // direct order - move front items
                    {
                        movedBrickIndexes: [0, 1, 2],
                        pillarBrickIndexPosition: 4
                    },
                    // reverse order - move front items
                    {
                        movedBrickIndexes: [2, 1, 0],
                        pillarBrickIndexPosition: 4
                    },
                    // random order  - move back items
                    {
                        movedBrickIndexes: [4, 2],
                        pillarBrickIndexPosition: 0
                    },
                    // random order - move front items
                    {
                        movedBrickIndexes: [2, 0],
                        pillarBrickIndexPosition: 4
                    },
                    // edge case
                    {
                        movedBrickIndexes: [0],
                        pillarBrickIndexPosition: 0
                    }
                    // todo: BUG - test case does not work
                    // it's a weired scenario which unlikely to happen through UI
                    // but nevertheless I have to fix it
                    // {
                    //     movedBrickIndexes: [2, 1],
                    //     pillarBrickIndexPosition: 1
                    // }
                ].forEach((testCase) => {
                    const afterMoveBrickIds = wm.api.core.getBrickIds();

                    wm.api.core.moveBrickAfterBrickId(
                        testCase.movedBrickIndexes.map((moveBrickIndex) => afterMoveBrickIds[moveBrickIndex]),
                        afterMoveBrickIds[testCase.pillarBrickIndexPosition]
                    );

                    const expectedMoveBrickIds = moveItemsAfterIndex(
                        afterMoveBrickIds,
                        testCase.movedBrickIndexes,
                        testCase.pillarBrickIndexPosition
                    );

                    expect(wm.api.core.getBrickIds()).toEqual(expectedMoveBrickIds);
                    checkLayoutStructure(wm, expectedLayoutStructure);
                });
            });

            it('should move bricks to particular column from rows with one column', () => {
                [
                    // direct order
                    {
                        movedBrickIndexes: [2, 3, 4],
                        pillarBrickIndexPosition: 1, // move to right column
                        expectedLayoutStructure: [
                            {
                                columns: [1, 4]
                            }
                        ]
                    },
                    // reverse order
                    {
                        movedBrickIndexes: [4, 3, 2],
                        pillarBrickIndexPosition: 1,
                        expectedLayoutStructure: [
                            {
                                columns: [1, 4]
                            }
                        ]
                    },
                    // random items
                    {
                        movedBrickIndexes: [4, 2],
                        pillarBrickIndexPosition: 1,
                        expectedLayoutStructure: [
                            {
                                columns: [1, 3]
                            },
                            {
                                columns: [1]
                            }
                        ]
                    }
                ].forEach((testCase) => {
                    const wm = wallModelFactory.create();

                    generateTwoColumnWithOneBrick(wm);

                    // add third brick to new row
                    wm.api.core.addDefaultBrick();
                    wm.api.core.addDefaultBrick();
                    wm.api.core.addDefaultBrick();

                    const beforeMoveBrickIds = wm.api.core.getBrickIds();

                    wm.api.core.moveBrickAfterBrickId(
                        testCase.movedBrickIndexes.map((moveBrickIndex) => beforeMoveBrickIds[moveBrickIndex]),
                        beforeMoveBrickIds[testCase.pillarBrickIndexPosition]
                    );

                    const expectedMoveBrickIds = moveItemsAfterIndex(
                        beforeMoveBrickIds,
                        testCase.movedBrickIndexes,
                        testCase.pillarBrickIndexPosition
                    );

                    expect(wm.api.core.getBrickIds()).toEqual(expectedMoveBrickIds);
                    checkLayoutStructure(wm, testCase.expectedLayoutStructure);
                });
            });

            it('should remove column without bricks', () => {
                // move bricks to column from sibling column
                const testCase = {
                    movedBrickIndexes: [0],
                    pillarBrickIndexPosition: 1, // move to right column
                    expectedLayoutStructure: [
                        {
                            columns: [2]
                        }
                    ]
                };

                const wm = wallModelFactory.create();

                generateTwoColumnWithOneBrick(wm);

                const beforeMoveBrickIds = wm.api.core.getBrickIds();

                wm.api.core.moveBrickAfterBrickId(
                    testCase.movedBrickIndexes.map((moveBrickIndex) => beforeMoveBrickIds[moveBrickIndex]),
                    beforeMoveBrickIds[testCase.pillarBrickIndexPosition]
                );

                const expectedMoveBrickIds = moveItemsAfterIndex(
                    beforeMoveBrickIds,
                    testCase.movedBrickIndexes,
                    testCase.pillarBrickIndexPosition
                );

                expect(wm.api.core.getBrickIds()).toEqual(expectedMoveBrickIds);
                checkLayoutStructure(wm, testCase.expectedLayoutStructure);
            });
        });

        describe('moveBrickBeforeBrickId()', () => {
            it('should move bricks to new row', () => {
                const wm = wallModelFactory.create();
                const expectedLayoutStructure: IRowStructure[] = [
                    {
                        columns: [1]
                    },
                    {
                        columns: [1]
                    },
                    {
                        columns: [1]
                    },
                    {
                        columns: [1]
                    },
                    {
                        columns: [1]
                    }
                ];

                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();

                [
                    // simple case - move back item
                    {
                        movedBrickIndexes: [1],  // brick indexes which have to be moved
                        pillarBrickIndexPosition: 0 // index before which bricks have to be moved
                    },
                    // simple case  - move front item
                    {
                        movedBrickIndexes: [0],
                        pillarBrickIndexPosition: 1
                    },
                    // direct order - move back item
                    {
                        movedBrickIndexes: [2, 3, 4],
                        pillarBrickIndexPosition: 1
                    },
                    // reverse order  - move back items
                    {
                        movedBrickIndexes: [4, 3, 2],
                        pillarBrickIndexPosition: 1
                    },
                    // direct order - move front items
                    {
                        movedBrickIndexes: [0, 1, 2],
                        pillarBrickIndexPosition: 4
                    },
                    // reverse order - move front items
                    {
                        movedBrickIndexes: [2, 1, 0],
                        pillarBrickIndexPosition: 4
                    },
                    // random order  - move back items
                    {
                        movedBrickIndexes: [4, 2],
                        pillarBrickIndexPosition: 1
                    },
                    // random order - move front items
                    {
                        movedBrickIndexes: [2, 0],
                        pillarBrickIndexPosition: 4
                    },
                    // edge case
                    {
                        movedBrickIndexes: [0],
                        pillarBrickIndexPosition: 0
                    }
                    // todo: BUG - test case does not work
                    // it's a weired scenario which unlikely to happen through UI
                    // but nevertheless I have to fix it
                    // {
                    //     movedBrickIndexes: [2, 1],
                    //     pillarBrickIndexPosition: 1
                    // }
                ].forEach((testCase) => {
                    const beforeMoveBrickIds = wm.api.core.getBrickIds();

                    wm.api.core.moveBrickBeforeBrickId(
                        testCase.movedBrickIndexes.map((moveBrickIndex) => beforeMoveBrickIds[moveBrickIndex]),
                        beforeMoveBrickIds[testCase.pillarBrickIndexPosition]
                    );

                    const expectedMoveBrickIds = moveItemsBeforeIndex(
                        beforeMoveBrickIds,
                        testCase.movedBrickIndexes,
                        testCase.pillarBrickIndexPosition
                    );

                    expect(wm.api.core.getBrickIds()).toEqual(expectedMoveBrickIds);
                    checkLayoutStructure(wm, expectedLayoutStructure);
                });
            });

            it('should move bricks to particular column from rows with one column', () => {
                [
                    // direct order
                    {
                        movedBrickIndexes: [2, 3, 4],
                        pillarBrickIndexPosition: 1, // move to right column
                        expectedLayoutStructure: [
                            {
                                columns: [1, 4]
                            }
                        ]
                    },
                    // reverse order
                    {
                        movedBrickIndexes: [4, 3, 2],
                        pillarBrickIndexPosition: 1,
                        expectedLayoutStructure: [
                            {
                                columns: [1, 4]
                            }
                        ]
                    },
                    // random items
                    {
                        movedBrickIndexes: [4, 2],
                        pillarBrickIndexPosition: 1,
                        expectedLayoutStructure: [
                            {
                                columns: [1, 3]
                            },
                            {
                                columns: [1]
                            }
                        ]
                    }
                ].forEach((testCase) => {
                    const wm = wallModelFactory.create();

                    generateTwoColumnWithOneBrick(wm);

                    // add third brick to new row
                    wm.api.core.addDefaultBrick();
                    wm.api.core.addDefaultBrick();
                    wm.api.core.addDefaultBrick();

                    const beforeMoveBrickIds = wm.api.core.getBrickIds();

                    wm.api.core.moveBrickBeforeBrickId(
                        testCase.movedBrickIndexes.map((moveBrickIndex) => beforeMoveBrickIds[moveBrickIndex]),
                        beforeMoveBrickIds[testCase.pillarBrickIndexPosition]
                    );

                    const expectedMoveBrickIds = moveItemsBeforeIndex(
                        beforeMoveBrickIds,
                        testCase.movedBrickIndexes,
                        testCase.pillarBrickIndexPosition
                    );

                    expect(wm.api.core.getBrickIds()).toEqual(expectedMoveBrickIds);
                    checkLayoutStructure(wm, testCase.expectedLayoutStructure);
                });
            });

            it('should remove column without bricks', () => {
                // move bricks to column from sibling column
                const testCase = {
                    movedBrickIndexes: [0],
                    pillarBrickIndexPosition: 1, // move to right column
                    expectedLayoutStructure: [
                        {
                            columns: [2]
                        }
                    ]
                };

                const wm = wallModelFactory.create();

                generateTwoColumnWithOneBrick(wm);

                const beforeMoveBrickIds = wm.api.core.getBrickIds();

                wm.api.core.moveBrickBeforeBrickId(
                    testCase.movedBrickIndexes.map((moveBrickIndex) => beforeMoveBrickIds[moveBrickIndex]),
                    beforeMoveBrickIds[testCase.pillarBrickIndexPosition]
                );

                const expectedMoveBrickIds = moveItemsBeforeIndex(
                    beforeMoveBrickIds,
                    testCase.movedBrickIndexes,
                    testCase.pillarBrickIndexPosition
                );

                expect(wm.api.core.getBrickIds()).toEqual(expectedMoveBrickIds);
                checkLayoutStructure(wm, testCase.expectedLayoutStructure);
            });
        });

        it('moveBrickBeforeBrickId() in same column', () => {
            // If there is only more then one column in the row then
            // new brick will be moved in the same column before defined brick id
            const wm = wallModelFactory.create();

            generateTwoColumnWithOneBrick(wm);

            const brickIds = wm.api.core.getBrickIds();

            // add third brick to new row
            wm.api.core.addDefaultBrick();

            const beforeMovingBrickIds = wm.api.core.getBrickIds();

            // move third brick to first row in the second column before second brick
            wm.api.core.moveBrickBeforeBrickId([beforeMovingBrickIds[2]], brickIds[1]);

            const afterMovingBrickIds = wm.api.core.getBrickIds();

            expect(wm.api.core.getRowCount()).toBe(1);

            let row;
            wm.api.core.traverse((row_) => {
                row = row_;
            });

            expect(wm.api.core.getColumnCount(0)).toBe(2);
            expect(row.columns[0].bricks.length).toBe(1);
            expect(row.columns[1].bricks.length).toBe(2);

            expect(beforeMovingBrickIds[0]).toBe(afterMovingBrickIds[0]);
            expect(beforeMovingBrickIds[1]).toBe(afterMovingBrickIds[2]);
            expect(beforeMovingBrickIds[2]).toBe(afterMovingBrickIds[1]);
        });

        describe('moveBrickToNewColumn()', () => {
            it('should create new column and move brick to it', () => {
                const wm = wallModelFactory.create();

                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();

                const brickIds = wm.api.core.getBrickIds();

                // todo: replace to CONSTANT
                const side = 'left';

                wm.api.core.moveBrickToNewColumn([brickIds[1]], brickIds[0], side);

                let row;
                wm.api.core.traverse((row_) => row = row_);

                expect(row.columns.length).toBe(2);
                expect(row.columns[0].bricks[0].id).toBe(brickIds[1]);
                expect(row.columns[1].bricks[0].id).toBe(brickIds[0]);
            });

            it('should create new column and move all bricks to it in direct order', () => {
                const wm = wallModelFactory.create();

                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();

                const brickIds = wm.api.core.getBrickIds();

                // todo: replace to CONSTANT
                const side = 'right';

                wm.api.core.moveBrickToNewColumn([brickIds[1], brickIds[2]], brickIds[0], side);

                let row;
                wm.api.core.traverse((row_) => row = row_);

                expect(row.columns.length).toBe(2);
                expect(row.columns[0].bricks[0].id).toBe(brickIds[0]);
                expect(row.columns[1].bricks[0].id).toBe(brickIds[1]);
                expect(row.columns[1].bricks[1].id).toBe(brickIds[2]);
            });

            it('should create new column and move all bricks to it in reverse order', () => {
                const wm = wallModelFactory.create();

                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();

                const brickIds = wm.api.core.getBrickIds();

                // todo: replace to CONSTANT
                const side = 'right';

                wm.api.core.moveBrickToNewColumn([brickIds[2], brickIds[1]], brickIds[0], side);

                let row;
                wm.api.core.traverse((row_) => row = row_);

                expect(row.columns.length).toBe(2);
                expect(row.columns[0].bricks[0].id).toBe(brickIds[0]);
                expect(row.columns[1].bricks[0].id).toBe(brickIds[2]);
                expect(row.columns[1].bricks[1].id).toBe(brickIds[1]);
            });
        });

        describe('clear', () => {
            it('should remove bricks', (done) => {
                const wm = wallModelFactory.create();

                wm.api.core.addDefaultBrick();
                wm.api.core.addDefaultBrick();

                expect(wm.api.core.getBrickIds().length).toBe(2);

                wm.api.core.clear().then(() => {
                    expect(wm.api.core.getBrickIds().length).toBe(0);

                    done();
                });
            });

            it('should call brick destructor', (done) => {
                const wm = wallModelFactory.create();

                wm.api.core.addDefaultBrick();

                const addedBrickId = wm.api.core.getBrickIds()[0];

                const textBrickSpecification = brickRegistry.get('text');

                const originalDestructor = textBrickSpecification.destructor;

                spyOn(textBrickSpecification, 'destructor').and.callThrough();

                wm.api.core.clear().then(() => {
                    expect(textBrickSpecification.destructor).toHaveBeenCalled();

                    // todo: replace "as any" to appropriate transformation
                    const brickSnapshot = (textBrickSpecification.destructor as any).calls.mostRecent().args[0];

                    expect(brickSnapshot.id).toBe(addedBrickId);
                    expect(brickSnapshot.tag).toBe('text');

                    textBrickSpecification.destructor = originalDestructor;

                    done();
                });
            });

            it('should support work without destructor', (done) => {
                const wm = wallModelFactory.create();

                wm.api.core.addDefaultBrick();

                const textBrickSpecification = brickRegistry.get('text');

                const originalDestructor = textBrickSpecification.destructor;

                delete textBrickSpecification.destructor;

                wm.api.core.clear().then(() => {
                    textBrickSpecification.destructor = originalDestructor;

                    done();
                });
            });
        });
    });
});

interface IRowStructure {
    // each number represents amount of bricks in the column
    columns: number[];
}

function checkLayoutStructure(wm: IWallModel, rows: IRowStructure[]) {
    expect(wm.api.core.getRowCount()).toBe(rows.length);

    let rowIndex = 0;

    wm.api.core.traverse((row) => {
        row.columns.forEach((column, columnIndex) => {
            // checks that each column contains appropriate number of bricks
            expect(column.bricks.length).toBe(rows[rowIndex].columns[columnIndex]);
        });

        rowIndex++;
    });
}

// helpers
function moveItemsBeforeIndex(array: string[], moveIndexes, index: number): string[] {
    return moveItemsNearIndex(array, moveIndexes, index, true);
}

function moveItemsAfterIndex(array: string[], moveIndexes, index: number): string[] {
    return moveItemsNearIndex(array, moveIndexes, index, false);
}

function moveItemsNearIndex(array: string[], moveIndexes, index: number, beforeIndex: boolean): string[] {
    let resultArray = array.slice();
    const movedItems = [];

    moveIndexes.forEach((moveIndex) => {
        const removedItem = resultArray.splice(moveIndex, 1, null)[0];

        movedItems.push(removedItem);
    });

    resultArray.splice((beforeIndex ? index : index + 1), 0, ...movedItems);
    resultArray = resultArray.filter((brickId) => Boolean(brickId));

    return resultArray;
}
