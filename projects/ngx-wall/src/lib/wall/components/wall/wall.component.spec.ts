import {CommonModule} from '@angular/common';
import {
    Component,
    DebugElement,
    EventEmitter,
    Injectable,
    Input,
    NgModule,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {
    BrickRegistry,
    IFocusContext,
    IOnWallFocus,
    IOnWallStateChange,
    IWallComponent,
    IWallModel,
    WallModelFactory
} from '../..';
import {TextBrickModule} from '../../../bricks/text-brick';
import {TEXT_BRICK_TAG} from '../../../bricks/text-brick/text-brick.constant';
import {PlaceholderRendererModule} from '../../../modules/components/placeholder-renderer';
import {PickOutModule} from '../../../modules/pick-out';
import {RadarModule} from '../../../modules/radar';
import {TowModule} from '../../../modules/tow';
import {WallCanvasBrickComponent, WallCanvasComponent, WallCanvasRowComponent} from '../wall-canvas';
import {WallComponent} from './wall.component';

class TestScope {
    rootNativeElement: HTMLElement;
    component: WallComponent;
    debugElement: DebugElement;
    fixture: ComponentFixture<WallComponent>;

    wallModel: IWallModel;

    initialize() {
        // const fixtureComponentRegistry: FixtureComponentRegistry = TestBed.get(FixtureComponentRegistry);

        return this.createComponent();
    }

    getElementsByTagName(tag: string): HTMLCollectionOf<any> {
        return this.rootNativeElement.getElementsByTagName(tag);
    }

    getFixtureComponent(): FixtureComponent {
        const fixtureComponentRegistry: FixtureComponentRegistry = TestBed.get(FixtureComponentRegistry);

        return fixtureComponentRegistry.get();
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
    }

    private createWallModel(): IWallModel {
        const wallModelFactory: WallModelFactory = TestBed.get(WallModelFactory);

        return wallModelFactory.create({});
    }
}

@Injectable()
class FixtureComponentRegistry {
    private component: FixtureComponent;

    register(component_: FixtureComponent) {
        this.component = component_;
    }

    get(): FixtureComponent {
        return this.component;
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

    constructor(private fixtureComponentRegistry: FixtureComponentRegistry) {
        this.fixtureComponentRegistry.register(this);
    }

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
    ],
    providers: [FixtureComponentRegistry]
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
                FixtureModule
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

            const fixtureComponent = testScope.getFixtureComponent();

            expect(fixtureComponent.id).toBeDefined();
        });

        it('should pass state to component', () => {
            const fixtureState = {
                foo: 'foo'
            };

            testScope.wallModel.api.core.addBrickAtStart('fixture', fixtureState);
            testScope.fixture.detectChanges();

            const fixtureComponent = testScope.getFixtureComponent();

            expect(fixtureComponent.state).toEqual(fixtureState);
        });

        it('should pass wallModel to component', () => {
            testScope.wallModel.api.core.addBrickAtStart('fixture', {});
            testScope.fixture.detectChanges();

            const fixtureComponent = testScope.getFixtureComponent();

            expect(fixtureComponent.wallModel).toEqual(testScope.wallModel);
        });

        it('should listen changes from @Output stateChanges component property', () => {
        });

        it('should call onWallStateChange callback', () => {
        });

        it('should call ngOnDestroy callback', () => {
        });

        it('should call onWallFocus callback', () => {
        });

        it('should pass onWallFocus context', () => {
        });
    });

    describe('[UI Api]', () => {
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

            testScope.fixture.detectChanges();

            testScope.fixture.whenStable().then(() => {
                const textBrickElement = testScope.getElementsByTagName('text-brick')[0];

                expect(textBrickState.text).toBe(textBrickElement.getElementsByTagName('p')[0].innerText);
            });
        }));
    });
});
