import {WallModelFactory} from '../factory/wall-model.factory';
import {BrickRegistry} from '../registry/brick-registry.service';
import {IBrickSnapshot} from '../wall';
import {IWallDefinition2} from './interfaces/wall-definition.interface2';

fdescribe('Wall Model', () => {
    const brickRegistry = new BrickRegistry();
    const wallModelFactory = new WallModelFactory(brickRegistry);

    const textRepresentation = 'TextBrickTextRepresentation';

    const defaultPlan: IWallDefinition2 = [];

    const simplePlan: IWallDefinition2 = [
        {
            id: '1',
            tag: 'text',
            data: {},
            meta: {}
        }
    ];

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
            ].forEach((plan) => {
                const wm = wallModelFactory.create({plan});

                expect(wm.api.core2.getPlan()).toEqual(plan);
            });
        });
    });

    describe('[Sort]', () => {
        it('should sort brick id by layout order', () => {
            const plan: IWallDefinition2 = [
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
            ];

            const wm = wallModelFactory.create({plan});

            const sortedBrickIds = wm.api.core2.sortBrickIdsByLayoutOrder(['2', '3', '1']);

            expect(sortedBrickIds).toEqual(['1', '2', '3']);
        });
    });

    describe('[Query API]', () => {
        it('should contain all query public api', () => {
            const wm = wallModelFactory.create();

            [
                'getBrickTag',
                'getPreviousBrickId',
                'getNextBrickId',
                'getBrickIds',
                'getBricksCount',
                'getNextTextBrickId',
                'getPreviousTextBrickId',
                'filterBricks',
                'isBrickAheadOf',
                'isRegisteredBrick',
            ].forEach((methodName) => {
                expect(wm.api.core2[methodName]).toBeDefined();
            });
        });

        it('isBrickAheadOf()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();
            wm.api.core2.addDefaultBrick();

            const brickIds = wm.api.core2.getBrickIds();

            expect(wm.api.core2.isBrickAheadOf(brickIds[0], brickIds[1])).toBe(true);
        });

        it('getBricksCount()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();
            wm.api.core2.addDefaultBrick();

            expect(wm.api.core2.getBricksCount()).toBe(2);
        });

        it('getBrickTag()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();

            expect(wm.api.core2.getBrickTag(wm.api.core2.getBrickIds()[0])).toBe('text');
        });

        it('getBrickIds()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();
            wm.api.core2.addDefaultBrick();

            expect(wm.api.core2.getBrickIds().length).toBe(2);
        });

        it('getNextBrickId()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();
            wm.api.core2.addDefaultBrick();

            const brickIds = wm.api.core2.getBrickIds();

            expect(wm.api.core2.getNextBrickId(brickIds[0])).toBe(brickIds[1]);
        });

        it('getPreviousBrickId()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();
            wm.api.core2.addDefaultBrick();

            const brickIds = wm.api.core2.getBrickIds();

            expect(wm.api.core2.getPreviousBrickId(brickIds[1])).toBe(brickIds[0]);
        });

        it('getNextTextBrickId()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();
            wm.api.core2.addDefaultBrick();

            const brickIds = wm.api.core2.getBrickIds();

            expect(wm.api.core2.getNextTextBrickId(brickIds[0])).toBe(brickIds[1]);
        });

        it('getPreviousTextBrickId()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();
            wm.api.core2.addDefaultBrick();

            const brickIds = wm.api.core2.getBrickIds();

            expect(wm.api.core2.getPreviousTextBrickId(brickIds[1])).toBe(brickIds[0]);
        });

        it('filterBricks()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();

            const brickIds = wm.api.core2.getBrickIds();

            wm.api.core2.addBrickAfterBrickId(brickIds[0], 'img');

            const filteredBricks = wm.api.core2.filterBricks((brick: IBrickSnapshot) => brick.tag === 'img');

            expect(filteredBricks.length).toBe(1);
            expect(filteredBricks[0].tag).toBe('img');
        });

        it('isRegisteredBrick()', () => {
            const wm = wallModelFactory.create();

            expect(wm.api.core2.isRegisteredBrick('text')).toBe(true);
            expect(wm.api.core2.isRegisteredBrick('header')).toBe(true);
            expect(wm.api.core2.isRegisteredBrick('img')).toBe(false);
        });

        describe('getBrickTextRepresentation()', () => {
            it('should use brick text representation', () => {
                const wm = wallModelFactory.create();

                wm.api.core2.addDefaultBrick();

                const brickTextRepresentation = wm.api.core2.getBrickTextRepresentation(wm.api.core2.getBrickIds()[0]);

                expect(brickTextRepresentation).toBe(textRepresentation);
            });

            it('should support default text representation', () => {
                const wm = wallModelFactory.create();

                wm.api.core2.addDefaultBrick();

                const textBrickSpecification = brickRegistry.get('text');

                const originalTextRepresentation = textBrickSpecification.textRepresentation;

                delete textBrickSpecification.textRepresentation;

                const brickTextRepresentation = wm.api.core2.getBrickTextRepresentation(wm.api.core2.getBrickIds()[0]);

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
                'removeBrick',
                'removeBricks',
                'clear'
            ].forEach((methodName) => {
                expect(wm.api.core2[methodName]).toBeDefined();
            });
        });

        it('setPlan()', () => {
            const wm = wallModelFactory.create({plan: defaultPlan});

            wm.api.core2.setPlan(simplePlan);

            expect(wm.api.core2.getPlan()).toEqual(simplePlan);
        });

        it('addDefaultBrick()', () => {
            const wm = wallModelFactory.create();

            expect(wm.api.core2.getBrickIds().length).toBe(0);

            wm.api.core2.addDefaultBrick();

            const brickIds = wm.api.core2.getBrickIds();
            expect(brickIds.length).toBe(1);

            const brick = wm.api.core2.getBrickSnapshot(brickIds[0]);
            expect(brick.tag).toBe('text');
        });

        it('addBrickAtStart()', () => {
            const wm = wallModelFactory.create();
            const brickState = {text: 'predefined state'};

            wm.api.core2.addDefaultBrick();
            wm.api.core2.addBrickAtStart('text', brickState);

            const firstBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[0]);

            expect(firstBrick.tag).toBe('text');
            expect(firstBrick.state.text).toBe(brickState.text);
        });

        fit('addBrickAfterBrickId()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();
            wm.api.core2.addDefaultBrick();

            const brickIds = wm.api.core2.getBrickIds();

            wm.api.core2.addBrickAfterBrickId(brickIds[0], 'header', {text: 'header'});

            const expectedBrickSnapshot = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[1]);

            // check that brick was added to right position
            expect(expectedBrickSnapshot.tag).toBe('header');
            expect(expectedBrickSnapshot.state.text).toBe('header');
        });

        it('addBrickBeforeBrickId2()', () => {
            const wm = wallModelFactory.create();

            const firstBrick = wm.api.core2.addBrickAtStart('text', {text: 'first'});
            const secondBrick = wm.api.core2.addBrickAfterBrickId(firstBrick.id, 'text', {text: 'second'});

            wm.api.core2.addBrickBeforeBrickId(secondBrick.id, 'text', {text: 'third'});

            const newFirstBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[0]);
            expect(newFirstBrick.state.text).toBe('first');

            const newSecondBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[1]);
            expect(newSecondBrick.state.text).toBe('third');

            const newThirdBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[2]);
            expect(newThirdBrick.state.text).toBe('second');
        });

        it('updateBrickState()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addBrickAtStart('text', {text: 'foo', unchanged: 'foo'});

            const brickId = wm.api.core2.getBrickIds()[0];

            wm.api.core2.updateBrickState(brickId, {text: 'bar'});

            expect(wm.api.core2.getBrickSnapshot(brickId).state.text).toBe('bar');
            expect(wm.api.core2.getBrickSnapshot(brickId).state.unchanged).toBe('foo');
        });

        it('turnBrickInto()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();

            const brickId = wm.api.core2.getBrickIds()[0];

            wm.api.core2.turnBrickInto(brickId, 'header');

            expect(wm.api.core2.getBrickSnapshot(brickId).tag).toBe('header');
        });

        it('removeBrick()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();

            const brickIds = wm.api.core2.getBrickIds();

            expect(brickIds.length).toBe(1);

            wm.api.core2.removeBrick(brickIds[0]);

            expect(wm.api.core2.getBrickIds().length).toBe(0);
        });

        it('removeBricks()', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();
            wm.api.core2.addDefaultBrick();
            expect(wm.api.core2.getBrickIds().length).toBe(2);

            wm.api.core2.removeBricks(wm.api.core2.getBrickIds());
            expect(wm.api.core2.getBrickIds().length).toBe(0);
        });

        it('moveBrickAfterBrickId()', () => {
            const wm = wallModelFactory.create();

            const firstBrick = wm.api.core2.addBrickAtStart('text', {text: 'first'});
            const secondBrick = wm.api.core2.addBrickAfterBrickId(firstBrick.id, 'text', {text: 'second'});
            const thirdBrick = wm.api.core2.addBrickAfterBrickId(secondBrick.id, 'text', {text: 'third'});
            const forthBrick = wm.api.core2.addBrickAfterBrickId(thirdBrick.id, 'text', {text: 'forth'});
            const fifthBrick = wm.api.core2.addBrickAfterBrickId(forthBrick.id, 'text', {text: 'fifth'});

            wm.api.core2.moveBrickAfterBrickId([
                secondBrick.id,
                firstBrick.id,
                fifthBrick.id,
                forthBrick.id,
            ], thirdBrick.id);

            const newFirstBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[0]);
            expect(newFirstBrick.state.text).toBe('third');

            const newSecondBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[1]);
            expect(newSecondBrick.state.text).toBe('first');

            const newThirdBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[2]);
            expect(newThirdBrick.state.text).toBe('second');

            const newForthBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[3]);
            expect(newForthBrick.state.text).toBe('forth');

            const newFifthBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[4]);
            expect(newFifthBrick.state.text).toBe('fifth');
        });

        it('moveBrickBeforeBrickId()', () => {
            const wm = wallModelFactory.create();

            const firstBrick = wm.api.core2.addBrickAtStart('text', {text: 'first'});
            const secondBrick = wm.api.core2.addBrickAfterBrickId(firstBrick.id, 'text', {text: 'second'});
            const thirdBrick = wm.api.core2.addBrickAfterBrickId(secondBrick.id, 'text', {text: 'third'});
            const forthBrick = wm.api.core2.addBrickAfterBrickId(thirdBrick.id, 'text', {text: 'forth'});
            const fifthBrick = wm.api.core2.addBrickAfterBrickId(forthBrick.id, 'text', {text: 'fifth'});

            wm.api.core2.moveBrickBeforeBrickId([
                secondBrick.id,
                firstBrick.id,
                fifthBrick.id,
                forthBrick.id,
            ], thirdBrick.id);

            const newFirstBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[0]);
            expect(newFirstBrick.state.text).toBe('first');

            const newSecondBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[1]);
            expect(newSecondBrick.state.text).toBe('second');

            const newThirdBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[2]);
            expect(newThirdBrick.state.text).toBe('forth');

            const newForthBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[3]);
            expect(newForthBrick.state.text).toBe('fifth');

            const newFifthBrick = wm.api.core2.getBrickSnapshot(wm.api.core2.getBrickIds()[4]);
            expect(newFifthBrick.state.text).toBe('third');
        });

        it('should remove bricks', () => {
            const wm = wallModelFactory.create();

            wm.api.core2.addDefaultBrick();
            wm.api.core2.addDefaultBrick();

            expect(wm.api.core2.getBrickIds().length).toBe(2);

            wm.api.core2.clear();
            expect(wm.api.core2.getBrickIds().length).toBe(0);
        });

        describe('clear', () => {
            it('should call brick destructor', () => {
                const wm = wallModelFactory.create();

                wm.api.core2.addDefaultBrick();

                const addedBrickId = wm.api.core2.getBrickIds()[0];

                const textBrickSpecification = brickRegistry.get('text');

                const originalDestructor = textBrickSpecification.destructor;

                spyOn(textBrickSpecification, 'destructor').and.callThrough();

                wm.api.core2.clear();

                expect(textBrickSpecification.destructor).toHaveBeenCalled();

                // todo: replace "as any" to appropriate transformation
                const brickSnapshot = (textBrickSpecification.destructor as any).calls.mostRecent().args[0];

                expect(brickSnapshot.id).toBe(addedBrickId);
                expect(brickSnapshot.tag).toBe('text');

                textBrickSpecification.destructor = originalDestructor;
            });

            it('should support work without destructor', () => {
                const wm = wallModelFactory.create();

                wm.api.core2.addDefaultBrick();

                const textBrickSpecification = brickRegistry.get('text');

                const originalDestructor = textBrickSpecification.destructor;

                delete textBrickSpecification.destructor;

                wm.api.core2.clear();

                textBrickSpecification.destructor = originalDestructor;
            });
        });
    });
});
