import {CommonModule} from '@angular/common';
import {Component, DebugElement, EventEmitter, Input, NgModule, OnInit, Output, SimpleChanges} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TextBrickModule} from '../../../bricks/text-brick/text-brick';
import {TEXT_BRICK_TAG} from '../../../bricks/text-brick/text-brick.constant';
import {RadarModule} from '../../../modules/radar/radar';
import {TowModule} from '../../../modules/tow/tow';
import {WallCanvasBrickComponent, WallCanvasComponent, WallCanvasRowComponent} from '../wall-canvas/wall-canvas';
import {WallComponent} from './wall.component';
import {IWallModel} from '../../model/interfaces/wall-model.interface';
import {WallModelFactory} from '../../factory/wall-model.factory';
import {IOnWallStateChange} from './interfaces/wall-component/on-wall-state-change.interface';
import {IOnWallFocus} from './interfaces/wall-component/on-wall-focus.interface';
import {IWallComponent} from './interfaces/wall-component/wall-component.interface';
import {IFocusContext} from './interfaces/wall-component/wall-component-focus-context.interface';
import {BrickRegistry} from '../../registry/brick-registry.service';
import {SelectedBrickEvent} from './events/selected-brick.event';
import {IWallUiApi} from './interfaces/ui-api.interface';
import {PlaceholderRendererModule} from '../../../modules/components/placeholder-renderer/placeholder-renderer.module';
import {PickOutModule} from '../../../modules/pick-out/pick-out.module';
import {MatIconModule} from '@angular/material';

class TestScope {
    rootNativeElement: HTMLElement;
    component: WallComponent;
    debugElement: DebugElement;
    fixture: ComponentFixture<WallComponent>;

    uiApi: IWallUiApi;

    wallModel: IWallModel;

    initialize() {
        return this.createComponent();
    }

    getDebugElementByCss(query: string): DebugElement {
        return this.debugElement.query(By.css(query));
    }

    getElementsByTagName(tag: string): HTMLCollectionOf<any> {
        return this.rootNativeElement.getElementsByTagName(tag);
    }

    getElementsByClassName(query: string): HTMLCollectionOf<any> {
        return this.rootNativeElement.getElementsByClassName(query);
    }

    render(): Promise<any> {
        this.fixture.detectChanges();

        return this.fixture.whenStable();
    }

    destroy() {
    }

    private createComponent() {
        // Fixture for debugging and testing a component.
        this.fixture = TestBed.createComponent(WallComponent);

        // DebugElement is abstraction over nativeElement,
        // because nativeElement might be different in different environments
        this.debugElement = this.fixture.debugElement;

        // it's root of component, not direct component so
        // type is HTMLElement because we run it in Browser, for mobile nativeElement might be different
        this.rootNativeElement = this.fixture.nativeElement;

        this.component = this.fixture.componentInstance;

        this.wallModel = this.createWallModel();

        // simulate the parent setting the input property
        this.component.model = this.wallModel;

        this.fixture.detectChanges();

        const initialChange: SimpleChanges = {
            model: {
                firstChange: true,
                currentValue: this.wallModel,
                previousValue: undefined,
                isFirstChange: () => true
            }
        };

        this.component.ngOnChanges(initialChange);

        this.uiApi = this.wallModel.api.ui;
    }

    private createWallModel(): IWallModel {
        const wallModelFactory: WallModelFactory = TestBed.get(WallModelFactory);

        return wallModelFactory.create({});
    }
}

@Component({
    selector: 'fixture-brick',
    template: ``
})
class FixtureComponent implements OnInit, IOnWallStateChange, IOnWallFocus, IWallComponent {
    @Input() id: string;
    @Input() state: any;
    @Input() wallModel: IWallModel;
    @Output() stateChanges: EventEmitter<any> = new EventEmitter();

    ngOnInit() {
    }

    onWallFocus(focusContext?: IFocusContext): void {
    }

    onWallStateChange(state: any): void {
    }
}

@NgModule({
    exports: [
        FixtureComponent
    ],
    declarations: [
        FixtureComponent
    ],
    entryComponents: [
        FixtureComponent
    ]
})
class FixtureModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'fixture',
            name: 'Fixture',
            component: FixtureComponent,
            description: 'Just start writing with plain text'
        });
    }
}

describe('WallComponent', () => {
    let testScope: TestScope;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                PickOutModule,
                TowModule,
                RadarModule,
                PlaceholderRendererModule,
                TextBrickModule,
                FixtureModule,
                MatIconModule
            ],
            providers: [
                BrickRegistry,
                WallModelFactory
            ],
            declarations: [
                WallComponent,
                WallCanvasComponent,
                WallCanvasRowComponent,
                WallCanvasBrickComponent,
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        testScope = new TestScope();
        testScope.initialize();
    });

    afterEach(() => {
        testScope.destroy();
        testScope = null;
    });

    it('should create', () => {
        expect(testScope.component).toBeDefined();
    });

    describe('[Initialization]', () => {
        it('should register "ui" api', () => {
            expect(testScope.wallModel.api.ui).toBeDefined();
        });
    });

    describe('[Interaction with brick]', () => {
        it('should pass id to component', () => {
            testScope.wallModel.api.core.addBrickAtStart('fixture', {});
            testScope.fixture.detectChanges();

            const fixtureComponent = testScope.getDebugElementByCss('fixture-brick').componentInstance;

            expect(fixtureComponent.id).toBeDefined();
        });

        it('should pass state to component', () => {
            const fixtureState = {
                foo: 'foo'
            };

            testScope.wallModel.api.core.addBrickAtStart('fixture', fixtureState);
            testScope.fixture.detectChanges();

            const fixtureComponent = testScope.getDebugElementByCss('fixture-brick').componentInstance;

            expect(fixtureComponent.state).toEqual(fixtureState);
        });

        it('should call onWallStateChange callback when state is changed by model', () => {
            const brickSnapshot = testScope.wallModel.api.core.addBrickAtStart('fixture');
            testScope.fixture.detectChanges();

            const fixtureComponent = testScope.getDebugElementByCss('fixture-brick').componentInstance;

            spyOn(fixtureComponent, 'onWallStateChange');

            // test action
            const newFixtureState = {
                foo: 'foo'
            };
            testScope.wallModel.api.core.updateBrickState(brickSnapshot.id, newFixtureState);

            // bind internal wall component state to the DOM
            testScope.fixture.detectChanges();

            // test assertions
            expect(fixtureComponent.onWallStateChange).toHaveBeenCalled();

            const stateChangeArguments = (fixtureComponent.onWallStateChange as jasmine.Spy)
                .calls.mostRecent().args;

            expect(stateChangeArguments[0]).toEqual(newFixtureState);
        });

        it('should pass wallModel to component', () => {
            testScope.wallModel.api.core.addBrickAtStart('fixture', {});
            testScope.fixture.detectChanges();

            const fixtureComponent = testScope.getDebugElementByCss('fixture-brick').componentInstance;

            expect(fixtureComponent.wallModel).toEqual(testScope.wallModel);
        });

        it('should listen changes from @Output stateChanges component property', () => {
            const fixtureBrickSnapshot = testScope.wallModel.api.core.addBrickAtStart('fixture', {});
            testScope.fixture.detectChanges();

            const fixtureComponent = testScope.getDebugElementByCss('fixture-brick').componentInstance;

            spyOn(testScope.wallModel.api.core, 'updateBrickState');

            const newFixtureState = {foo: 'foo'};

            // test action
            fixtureComponent.stateChanges.emit(newFixtureState);

            // test assertions
            expect(testScope.wallModel.api.core.updateBrickState).toHaveBeenCalled();

            const updateBrickStateArgs = (testScope.wallModel.api.core.updateBrickState as jasmine.Spy)
                .calls.mostRecent().args;

            expect(updateBrickStateArgs[0]).toEqual(fixtureBrickSnapshot.id);
            expect(updateBrickStateArgs[1]).toEqual(newFixtureState);
        });

        it('should call onWallFocus callback', () => {
            const fixtureBrickSnapshot = testScope.wallModel.api.core.addBrickAtStart('fixture');
            testScope.fixture.detectChanges();

            const fixtureComponent = testScope.getDebugElementByCss('fixture-brick').componentInstance;

            spyOn(fixtureComponent, 'onWallFocus');

            // test action
            testScope.uiApi.focusOnBrickId(fixtureBrickSnapshot.id);
            testScope.fixture.detectChanges();

            // test assertion
            expect(fixtureComponent.onWallFocus).toHaveBeenCalled();
        });

        it('should pass onWallFocus context', () => {
            const fixtureBrickSnapshot = testScope.wallModel.api.core.addBrickAtStart('fixture', {});
            testScope.fixture.detectChanges();

            const fixtureComponent = testScope.getDebugElementByCss('fixture-brick').componentInstance;

            spyOn(fixtureComponent, 'onWallFocus');

            // test action
            const focusContext = {initiator: '', details: 'foo'};
            testScope.uiApi.focusOnBrickId(fixtureBrickSnapshot.id, focusContext);
            testScope.fixture.detectChanges();

            // test assertion
            const wallFocusArgs = (fixtureComponent.onWallFocus as jasmine.Spy)
                .calls.mostRecent().args;

            expect(wallFocusArgs[0]).toBe(focusContext);
        });
    });

    describe('[Canvas UI interaction]', () => {
        it('should add default brick when user clicks by expander', async(() => {
            // test action
            testScope.getElementsByClassName('wall-canvas__expander')[0].click();

            testScope.render().then(() => {
                // test assertion
                const textBrickElement = testScope.getElementsByTagName('text-brick')[0];

                expect(textBrickElement).toBeDefined();
            });
        }));
    });

    describe('[UI Api]', () => {
        it('should remove brick', async(() => {
            testScope.wallModel.api.core.addBrickAtStart(TEXT_BRICK_TAG, {test: 'foo'});
            testScope.wallModel.api.core.addBrickAtStart(TEXT_BRICK_TAG, {test: 'bar'});

            testScope.render().then(() => {
                expect(testScope.getElementsByTagName('text-brick').length).toBe(2);

                const brickId = testScope.wallModel.api.core.getBrickIds()[0];

                testScope.uiApi.removeBrick(brickId);

                testScope.render().then(() => {
                    expect(testScope.getElementsByTagName('text-brick').length).toBe(1);
                });
            });
        }));

        it('should remove bricks', async(() => {
            testScope.wallModel.api.core.addDefaultBrick();
            testScope.wallModel.api.core.addDefaultBrick();
            testScope.wallModel.api.core.addDefaultBrick();

            testScope.render().then(() => {
                expect(testScope.getElementsByTagName('text-brick').length).toBe(3);

                const brickIds = testScope.wallModel.api.core.getBrickIds();

                testScope.uiApi.removeBricks([brickIds[0], brickIds[1]]);

                testScope.render().then(() => {
                    expect(testScope.getElementsByTagName('text-brick').length).toBe(1);
                });
            });
        }));

        it('should focus on only empty text brick when user tries to delete it', async(() => {
            testScope.wallModel.api.core.addDefaultBrick();

            testScope.render().then(() => {
                const textBrickDebugElement = testScope.getDebugElementByCss('text-brick');

                spyOn(textBrickDebugElement.componentInstance, 'onWallFocus');

                testScope.uiApi.removeBrick(testScope.wallModel.api.core.getBrickIds()[0]);

                testScope.fixture.detectChanges();

                expect(textBrickDebugElement.componentInstance.onWallFocus).toHaveBeenCalled();
            });
        }));

        describe('selectBrick()', () => {
            it('should select brick', () => {
                const textBrickSnapshot = testScope.wallModel.api.core.addBrickAtStart('text');

                // test action
                testScope.uiApi.selectBrick(textBrickSnapshot.id);

                // test assertions
                const selectedBricks = testScope.uiApi.getSelectedBrickIds();

                expect(selectedBricks.length).toBe(1);
                expect(selectedBricks[0]).toBe(textBrickSnapshot.id);
            });

            it('should trigger SelectedBrick event after brick selection', () => {
                const textBrickSnapshot = testScope.wallModel.api.core.addBrickAtStart('text');

                let event;
                testScope.uiApi.subscribe((e) => event = e);

                // test action
                testScope.uiApi.selectBrick(textBrickSnapshot.id);

                expect(event).toBeDefined();
                expect(event instanceof SelectedBrickEvent).toBeTruthy();
                expect(event.selectedBrickIds).toEqual([textBrickSnapshot.id]);
            });

            it('should select new brick and discard previous', () => {
                const textBrickSnapshot1 = testScope.wallModel.api.core.addBrickAtStart('text');
                const textBrickSnapshot2 = testScope.wallModel.api.core.addBrickAtStart('text');

                testScope.uiApi.selectBrick(textBrickSnapshot1.id);
                expect(testScope.uiApi.getSelectedBrickIds().length).toBe(1);
                expect(testScope.uiApi.getSelectedBrickIds()[0]).toBe(textBrickSnapshot1.id);

                // test action
                testScope.uiApi.selectBrick(textBrickSnapshot2.id);
                expect(testScope.uiApi.getSelectedBrickIds().length).toBe(1);
                expect(testScope.uiApi.getSelectedBrickIds()[0]).toBe(textBrickSnapshot2.id);
            });

            it('should select few bricks', () => {
                const textBrickSnapshot1 = testScope.wallModel.api.core.addBrickAtStart('text');
                const textBrickSnapshot2 = testScope.wallModel.api.core.addBrickAfterBrickId(textBrickSnapshot1.id, 'text');

                // test action
                testScope.uiApi.selectBricks([textBrickSnapshot1.id, textBrickSnapshot2.id]);

                // test assertions
                const selectedBricks = testScope.uiApi.getSelectedBrickIds();

                expect(selectedBricks.length).toBe(2);
                expect(selectedBricks[0]).toBe(textBrickSnapshot1.id);
                expect(selectedBricks[1]).toBe(textBrickSnapshot2.id);
            });

            it('should sort selected bricks based their layout position', () => {
                const textBrickSnapshot1 = testScope.wallModel.api.core.addBrickAtStart('text');
                const textBrickSnapshot2 = testScope.wallModel.api.core.addBrickAfterBrickId(textBrickSnapshot1.id, 'text');

                // test action
                testScope.uiApi.selectBricks([textBrickSnapshot2.id, textBrickSnapshot1.id]);

                // test assertions
                const selectedBricks = testScope.uiApi.getSelectedBrickIds();

                expect(selectedBricks.length).toBe(2);
                expect(selectedBricks[0]).toBe(textBrickSnapshot1.id);
                expect(selectedBricks[1]).toBe(textBrickSnapshot2.id);
            });

            it('should trigger SelectedBrickEvent event after brick selections', () => {
                testScope.wallModel.api.core.addDefaultBrick();
                testScope.wallModel.api.core.addDefaultBrick();

                let event;
                testScope.uiApi.subscribe((e) => event = e);

                const brickIds = testScope.wallModel.api.core.getBrickIds();

                // test action
                testScope.uiApi.selectBricks(brickIds);

                expect(event).toBeDefined();
                expect(event instanceof SelectedBrickEvent).toBeTruthy();
                expect(event.selectedBrickIds).toEqual(brickIds);
            });
        });

        describe('unSelectBricks()', () => {
            it('should unselect all brick ids', () => {
                testScope.wallModel.api.core.addDefaultBrick();

                // test action
                testScope.uiApi.selectBricks(testScope.wallModel.api.core.getBrickIds());

                expect(testScope.uiApi.getSelectedBrickIds().length).toBe(1);

                // test assertions
                testScope.uiApi.unSelectBricks();

                expect(testScope.uiApi.getSelectedBrickIds().length).toBe(0);
            });

            it('should trigger SelectedBrickEvent event after brick unselection', () => {
                testScope.wallModel.api.core.addDefaultBrick();

                // test action
                testScope.uiApi.selectBricks(testScope.wallModel.api.core.getBrickIds());
                expect(testScope.uiApi.getSelectedBrickIds().length).toBe(1);

                let event;
                testScope.uiApi.subscribe((e) => event = e);

                // test assertions
                testScope.uiApi.unSelectBricks();

                // test assertions
                expect(event).toBeDefined();
                expect(event instanceof SelectedBrickEvent).toBeTruthy();
                expect(event.selectedBrickIds).toEqual([]);
            });
        });

        describe('focusOnPreviousTextBrick()', () => {
            it('should call onWallFocus callback', async(() => {
                const brickSnapshot1 = testScope.wallModel.api.core.addBrickAtStart('text');
                const brickSnapshot2 = testScope.wallModel.api.core.addBrickAfterBrickId(brickSnapshot1.id, 'fixture');

                testScope.render().then(() => {
                    const textBrickDebugElement = testScope.getDebugElementByCss('text-brick');

                    spyOn(textBrickDebugElement.componentInstance, 'onWallFocus');

                    // test action
                    testScope.uiApi.focusOnPreviousTextBrick(brickSnapshot2.id);
                    testScope.fixture.detectChanges();

                    // test assertion
                    expect(textBrickDebugElement.componentInstance.onWallFocus).toHaveBeenCalled();
                });
            }));

            it('should pass focus context', async(() => {
                const brickSnapshot1 = testScope.wallModel.api.core.addBrickAtStart('text');
                const brickSnapshot2 = testScope.wallModel.api.core.addBrickAfterBrickId(brickSnapshot1.id, 'fixture');

                testScope.render().then(() => {
                    const textBrickDebugElement = testScope.getDebugElementByCss('text-brick');

                    spyOn(textBrickDebugElement.componentInstance, 'onWallFocus');

                    // test action
                    const focusContext = {
                        initiator: 'unit-test',
                        details: 'foo'
                    };
                    testScope.uiApi.focusOnPreviousTextBrick(brickSnapshot2.id, focusContext);
                    testScope.fixture.detectChanges();

                    // test assertion
                    expect(textBrickDebugElement.componentInstance.onWallFocus).toHaveBeenCalled();

                    const onWallFocusArgs = (textBrickDebugElement.componentInstance.onWallFocus as jasmine.Spy)
                        .calls.mostRecent().args;

                    expect(onWallFocusArgs[0]).toEqual(focusContext);
                });
            }));
        });
    });

    describe('[Model events reaction]', () => {
        it('should render default brick', () => {
            testScope.wallModel.api.core.addDefaultBrick();

            testScope.fixture.detectChanges();

            expect(testScope.getElementsByTagName('text-brick').length).toBe(1);
        });

        it('should render text brick and pass state', async(() => {
            const textBrickState = {
                text: 'initial'
            };

            testScope.wallModel.api.core.addBrickAtStart(TEXT_BRICK_TAG, textBrickState);

            testScope.render().then(() => {
                const textBrickElement = testScope.getElementsByTagName('text-brick')[0];

                expect(textBrickState.text).toBe(textBrickElement.getElementsByTagName('p')[0].innerText);
            });
        }));
    });
});
