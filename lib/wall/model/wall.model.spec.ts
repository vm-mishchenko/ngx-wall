import { BrickRegistry } from '../registry/brick-registry.service';
import { IWallDefinition } from '../wall.interfaces';
import { WallModelFactory } from './wall-model.factory';

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
            component: 'FAKE'
        });

        brickRegistry.register({
            tag: 'header',
            component: 'FAKE'
        });
    });

    it('should be defined', () => {
        const wm = wallModelFactory.create(defaultPlan);

        expect(wm).toBeDefined();
    });

    describe('[Initialization]', () => {
        it('should return default plan', () => {
            const wm = wallModelFactory.create(defaultPlan);

            expect(wm.getPlan()).toEqual(defaultPlan);
        });

        it('should be initialized correct', () => {
            const wm = wallModelFactory.create(simplePlan);

            expect(wm.getPlan()).toEqual(simplePlan);
        });
    });

    describe('[Add Brick]', () => {
        it('should add after brick id', () => {
            const wm = wallModelFactory.create(defaultPlan);
        });
    });
});
