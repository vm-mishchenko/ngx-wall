import { BrickRegistry } from '../registry/brick-registry.service';
import { WallModelFactory } from './wall-model.factory';

describe('Wall Model', function () {
    let brickRegistry = new BrickRegistry();
    let wallModelFactory = new WallModelFactory(brickRegistry);

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
        const wm = wallModelFactory.create({
            bricks: [],
            layout: {
                bricks: []
            }
        });

        expect(wm).toBeDefined();
    });


    describe('[Add Brick]', () => {
        it('should add brick to direct position', () => {
            const wm = wallModelFactory.create({
                bricks: [],
                layout: {
                    bricks: []
                }
            });

            wm.addBrick('text', 0, 0, 0);

            const plan = wm.getPlan();

            expect(plan.bricks[0]).toBeDefined();
            expect(plan.bricks[0].tag).toBeDefined('text');
        });
    });
});