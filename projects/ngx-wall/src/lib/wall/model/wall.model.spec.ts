import {IWallDefinition} from '../domain/definitions/wall-definition.interface';
import {BrickRegistry} from '../registry/brick-registry.service';
import {WallModelFactory} from './wall-model.factory';

describe('Wall Model', () => {
    const brickRegistry = new BrickRegistry();
    const wallModelFactory = new WallModelFactory(brickRegistry);

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

    beforeAll(() => {
        brickRegistry.register({
            tag: 'text',
            name: 'FAKE',
            description: 'FAKE',
            component: 'FAKE',
            supportText: true
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
        it('should return default plan', () => {
            const wm = wallModelFactory.create({plan: defaultPlan});

            expect(wm.api.core.getPlan()).toEqual(defaultPlan);
        });

        it('should be initialized correct', () => {
            const wm = wallModelFactory.create({plan: simplePlan});

            expect(wm.api.core.getPlan()).toEqual(simplePlan);
        });
    });

    describe('[Filter]', () => {
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
        it('should return row count', () => {
            const wm = wallModelFactory.create();

            expect(wm.api.core.getRowCount()).toBe(0);

            wm.api.core.addDefaultBrick();

            expect(wm.api.core.getRowCount()).toBe(1);
        });

        it('should return column count', () => {
            const wm = wallModelFactory.create();
            const rowIndex = 0;

            wm.api.core.addDefaultBrick();

            expect(wm.api.core.getColumnCount(rowIndex)).toBe(1);
        });

        it('should define is Brick Ahead Of other brick', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            const brickIds = wm.api.core.getBrickIds();

            expect(wm.api.core.isBrickAheadOf(brickIds[0], brickIds[1])).toBe(true);
        });

        it('should return brick count', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            expect(wm.api.core.getBricksCount()).toBe(2);
        });

        it('should return brick tag by brick Id', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();

            expect(wm.api.core.getBrickTag(wm.api.core.getBrickIds()[0])).toBe('text');
        });

        it('should return brick Ids', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            expect(wm.api.core.getBrickIds().length).toBe(2);
        });

        it('should return next brick id', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            const brickIds = wm.api.core.getBrickIds();

            expect(wm.api.core.getNextBrickId(brickIds[0])).toBe(brickIds[1]);
        });

        it('should return previous brick id', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            const brickIds = wm.api.core.getBrickIds();

            expect(wm.api.core.getPreviousBrickId(brickIds[1])).toBe(brickIds[0]);
        });

        it('should return next text brick id', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            const brickIds = wm.api.core.getBrickIds();

            expect(wm.api.core.getNextTextBrickId(brickIds[0])).toBe(brickIds[1]);
        });

        it('should return previous text brick id', () => {
            const wm = wallModelFactory.create();

            wm.api.core.addDefaultBrick();
            wm.api.core.addDefaultBrick();

            const brickIds = wm.api.core.getBrickIds();

            expect(wm.api.core.getPreviousTextBrickId(brickIds[1])).toBe(brickIds[0]);
        });
    });
});
