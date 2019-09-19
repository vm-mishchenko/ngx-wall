import {CommonModule} from '@angular/common';
import {DebugElement} from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {StickyModalModule} from 'ngx-sticky-modal';
import {ContenteditableModule} from '../../../modules/contenteditable/contenteditable.module';
import {HelperComponentsModule} from '../../../modules/helper-components/helper-components';
import {PlaceCaretToPosition} from '../../../modules/utils/node/place-caret-to-position';
import {IWallModel} from '../../../wall/wall';
import {FOCUS_INITIATOR} from '../../base-text-brick/base-text-brick.constant';
import {IBaseTextState} from '../../base-text-brick/base-text-state.interface';
import {TEXT_BRICK_TAG} from '../text-brick.constant';
import {TextBrickComponent} from './text-brick.component';

interface TestScopeOptions {
    initialState?: IBaseTextState;
}

class TestScope {
    initialState: IBaseTextState = {
        text: 'initial',
        tabs: 0
    };

    mockWallModel: any = {
        api: {
            core2: {},
            ui: {}
        }
    };

    // elements
    nativeElement: HTMLElement;
    rootNativeElement: HTMLElement;
    component: TextBrickComponent;
    debugElement: DebugElement;
    fixture: ComponentFixture<TextBrickComponent>;

    constructor(options?: TestScopeOptions) {
        if (options && options.initialState) {
            this.initialState = {
                ...this.initialState,
                ...options.initialState
            };
        }
    }

    initialize(): Promise<any> {
        return this.createComponent();
    }

    destroy() {
    }

    updateComponentState(newState: IBaseTextState): Promise<any> {
        this.fixture.componentInstance.state = newState;
        this.fixture.componentInstance.onWallStateChange(newState);
        return this.whenRendering();
    }

    setDOMInnerText(newText: string) {
        this.nativeElement.innerText = newText;

        // after dispatching Angular call template call back
        this.nativeElement.dispatchEvent(new Event('input'));
    }

    getDOMInnerHTML(): string {
        return this.nativeElement.innerHTML;
    }

    // waiting until component state will be rendered
    whenRendering(): Promise<any> {
        this.fixture.detectChanges();

        return this.fixture.whenStable();
    }

    // mocking
    /*
    * @param {string} apiString "core2.removeBrick"
    * */
    mock(apiString: string): jasmine.Spy {
        // I wish I had a time to fix that shame
        const paths = apiString.split('.');
        const method = paths.splice(-1)[0];

        let currentObject = this.mockWallModel.api;

        paths.forEach((path, i) => {
            if (!currentObject[path]) {
                currentObject[path] = {};
            }

            currentObject = currentObject[path];
        });

        currentObject[method] = jasmine.createSpy(method);

        return currentObject[method];
    }

    mockMethods(apis: string[]) {
        apis.forEach((apiString) => this.mock(apiString));
    }

    getRecentArguments(apiString): any[] {
        // I wish I had a time to fix that shame
        const paths = apiString.split('.');
        const method = paths.splice(-1)[0];

        let currentObject = this.mockWallModel.api;

        paths.forEach((path, i) => {
            if (!currentObject[path]) {
                currentObject[path] = {};
            }

            currentObject = currentObject[path];
        });

        return (currentObject[method] as any).calls.mostRecent().args;
    }

    private createComponent(): Promise<any> {
        // Fixture for debugging and testing a component.
        this.fixture = TestBed.createComponent(TextBrickComponent);

        // DebugElement is abstraction over nativeElement,
        // because nativeElement might be different in different environments
        this.debugElement = this.fixture.debugElement;

        // it's root of component, not direct component so
        // type is HTMLElement because we run it in Browser, for mobile nativeElement might be different
        this.rootNativeElement = this.fixture.nativeElement;

        // P HTMLElement
        this.nativeElement = this.debugElement.query(By.css('p')).nativeElement;

        // represents the Angular TypeScript class for the running component
        this.component = this.fixture.componentInstance;

        // simulate the parent setting the input property
        this.component.id = '1';
        this.component.wallModel = (this.mockWallModel as IWallModel);
        this.component.state = this.initialState;

        this.fixture.detectChanges();

        // waiting for component rendering
        return this.fixture.whenStable();
    }
}

fdescribe('TextBrickComponent', () => {
    let testScope: TestScope;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                CommonModule,
                ContenteditableModule,
                HelperComponentsModule,
                StickyModalModule
            ],
            declarations: [TextBrickComponent]
        }).compileComponents();
    }));

    beforeEach((done) => {
        testScope = new TestScope();
        testScope.initialize().then(done);
    });

    afterEach(() => {
        testScope.destroy();
        testScope = null;
    });

    it('should create', () => {
        expect(testScope.component).toBeDefined();
    });

    describe('[Basic]', () => {
        it('should render new text from model', async(() => {
            const newState = {
                text: 'initial state'
            };

            testScope.updateComponentState({
                text: 'initial state',
                tabs: 0
            }).then(() => {
                expect(testScope.getDOMInnerHTML()).toBe(newState.text);
            });
        }));
    });

    describe('[Text change]', () => {
        it('should save state when text is changed from DOM', fakeAsync(() => {
            const newEnteredText = 'test';

            let capturedState;

            testScope.component.stateChanges.subscribe((newState) => capturedState = newState);

            testScope.setDOMInnerText(newEnteredText);

            expect(capturedState.text).toBe(newEnteredText);
        }));
    });

    describe('[Keypress Navigation]', () => {
        describe('[Enter]', () => {
            it('should add empty brick after and focus on it when there is not text', fakeAsync(() => {
                testScope.updateComponentState({
                    text: '',
                    tabs: 0
                }).then(() => {
                    const mockGetSelection = spyOn(window, 'getSelection');

                    const mockNewAddedBrickSnapshot = {
                        id: '2'
                    };

                    testScope.mock('core2.addBrickAfterBrickId').and.returnValue(mockNewAddedBrickSnapshot);
                    testScope.mock('ui.mode.edit.focusOnBrickId');

                    const keyEvent = new KeyboardEvent('keydown', {code: 'Enter'});

                    mockGetSelection.and.returnValue({
                        focusOffset: 0,
                        focusNode: testScope.nativeElement
                    });

                    // test action
                    testScope.component.onKeyPress(keyEvent);

                    tick();

                    // test assertions
                    const addBrickArguments = testScope.getRecentArguments('core2.addBrickAfterBrickId');
                    const focusOnBrickIdArguments = testScope.getRecentArguments('ui.mode.edit.focusOnBrickId');

                    expect(testScope.mockWallModel.api.core2.addBrickAfterBrickId).toHaveBeenCalled();
                    expect(testScope.mockWallModel.api.ui.mode.edit.focusOnBrickId).toHaveBeenCalled();

                    expect(addBrickArguments[0]).toBe(testScope.component.id);
                    expect(addBrickArguments[1]).toBe(TEXT_BRICK_TAG);
                    expect(addBrickArguments[2]).toEqual({
                        text: '',
                        tabs: testScope.component.state.tabs
                    });
                    expect(focusOnBrickIdArguments[0]).toBe(mockNewAddedBrickSnapshot.id);
                });
            }));

            it('should add empty brick after and focus on it when caret stay at the end', fakeAsync(() => {
                testScope.updateComponentState({
                    text: 'initial',
                    tabs: 0
                }).then(() => {
                    const mockGetSelection = spyOn(window, 'getSelection');

                    const mockNewAddedBrickSnapshot = {
                        id: '2'
                    };

                    testScope.mock('core2.addBrickAfterBrickId').and.returnValue(mockNewAddedBrickSnapshot);
                    testScope.mock('ui.mode.edit.focusOnBrickId');

                    const keyEvent = new KeyboardEvent('keydown', {code: 'Enter'});

                    mockGetSelection.and.returnValue({
                        focusOffset: 7,
                        focusNode: testScope.nativeElement.childNodes[0]
                    });

                    // test action
                    testScope.component.onKeyPress(keyEvent);

                    tick();

                    // test assertions
                    const addBrickArguments = testScope.getRecentArguments('core2.addBrickAfterBrickId');
                    const focusOnBrickIdArguments = testScope.getRecentArguments('ui.mode.edit.focusOnBrickId');

                    expect(testScope.mockWallModel.api.core2.addBrickAfterBrickId).toHaveBeenCalled();
                    expect(testScope.mockWallModel.api.ui.mode.edit.focusOnBrickId).toHaveBeenCalled();

                    expect(addBrickArguments[0]).toBe(testScope.component.id);
                    expect(addBrickArguments[1]).toBe(TEXT_BRICK_TAG);
                    expect(addBrickArguments[2]).toEqual({
                        text: '',
                        tabs: testScope.component.state.tabs
                    });
                    expect(focusOnBrickIdArguments[0]).toBe(mockNewAddedBrickSnapshot.id);
                });
            }));

            it('should add empty brick before when caret stay at the start', async(() => {
                testScope.updateComponentState({
                    text: 'initial',
                    tabs: 0
                }).then(() => {
                    const mockGetSelection = spyOn(window, 'getSelection');

                    testScope.mock('core2.addBrickBeforeBrickId');
                    spyOn(testScope.nativeElement, 'scrollIntoView');

                    const keyEvent = new KeyboardEvent('keydown', {code: 'Enter'});

                    mockGetSelection.and.returnValue({
                        focusOffset: 0,
                        focusNode: testScope.nativeElement.childNodes[0]
                    });

                    // test action
                    testScope.component.onKeyPress(keyEvent);

                    // test assertions
                    expect(testScope.nativeElement.scrollIntoView).toHaveBeenCalled();
                    expect(testScope.mockWallModel.api.core2.addBrickBeforeBrickId).toHaveBeenCalled();

                    const addBrickArguments = testScope.getRecentArguments('core2.addBrickBeforeBrickId');
                    expect(addBrickArguments[0]).toBe(testScope.component.id);
                    expect(addBrickArguments[1]).toBe(TEXT_BRICK_TAG);
                    expect(addBrickArguments[2]).toEqual({
                        text: '',
                        tabs: testScope.component.state.tabs
                    });
                });
            }));

            it('should split text and focus on new brick', fakeAsync(() => {
                testScope.updateComponentState({
                    text: 'initial',
                    tabs: 0
                }).then(() => {
                    const mockGetSelection = spyOn(window, 'getSelection');

                    const mockNewAddedBrickSnapshot = {
                        id: '2'
                    };

                    testScope.mock('core2.addBrickAfterBrickId').and.returnValue(mockNewAddedBrickSnapshot);
                    testScope.mock('ui.mode.edit.focusOnBrickId');

                    let capturedState;
                    testScope.component.stateChanges.subscribe((updatedState) => capturedState = updatedState);

                    const keyEvent = new KeyboardEvent('keydown', {code: 'Enter'});

                    mockGetSelection.and.returnValue({
                        focusOffset: 3,
                        focusNode: testScope.nativeElement.childNodes[0]
                    });

                    // test action
                    testScope.component.onKeyPress(keyEvent);

                    tick();

                    // test assertions
                    const addBrickArguments = testScope.getRecentArguments('core2.addBrickAfterBrickId');
                    const focusOnBrickIdArguments = testScope.getRecentArguments('ui.mode.edit.focusOnBrickId');

                    expect(testScope.mockWallModel.api.core2.addBrickAfterBrickId).toHaveBeenCalled();
                    expect(testScope.mockWallModel.api.ui.mode.edit.focusOnBrickId).toHaveBeenCalled();

                    expect(addBrickArguments[0]).toBe(testScope.component.id);
                    expect(addBrickArguments[1]).toBe(TEXT_BRICK_TAG);
                    expect(addBrickArguments[2]).toEqual({
                        text: 'tial',
                        tabs: testScope.component.state.tabs
                    });
                    expect(focusOnBrickIdArguments[0]).toBe(mockNewAddedBrickSnapshot.id);
                    expect(capturedState).toEqual({
                        tabs: 0,
                        text: 'ini'
                    });
                });
            }));

            it('should split text correctly', async(() => {
                const mockGetSelection = spyOn(window, 'getSelection');

                const mockNewAddedBrickSnapshot = {
                    id: '2'
                };

                testScope.mock('core2.addBrickAfterBrickId').and.returnValue(mockNewAddedBrickSnapshot);
                testScope.mock('ui.mode.edit.focusOnBrickId');

                [
                    {
                        initialText: 'initial',
                        focusOffset: 7,
                        focusNode: () => testScope.nativeElement.childNodes[0],
                        expectedFirstText: 'initial',
                        expectedNewText: '',
                    },
                    {
                        initialText: 'initial',
                        focusOffset: 4,
                        focusNode: () => testScope.nativeElement.childNodes[0],
                        expectedFirstText: 'init',
                        expectedNewText: 'ial',
                    },
                    {
                        initialText: 'text <b>STRING</b> text',
                        focusOffset: 5,
                        focusNode: () => testScope.nativeElement.childNodes[2],
                        expectedFirstText: 'text <b>STRING</b> text',
                        expectedNewText: '',
                    },
                    {
                        initialText: 'text <b>STRING</b> text',
                        focusOffset: 2,
                        focusNode: () => testScope.nativeElement.childNodes[1].childNodes[0],
                        expectedFirstText: 'text <b>ST</b>',
                        expectedNewText: '<b>RING</b> text',
                    },
                    {
                        initialText: 'text <b>STR<i>ING</i></b> text',
                        focusOffset: 1,
                        focusNode: () => testScope.nativeElement.childNodes[1].childNodes[1].childNodes[0], // I text string
                        expectedFirstText: 'text <b>STR<i>I</i></b>',
                        expectedNewText: '<b><i>NG</i></b> text'
                    }
                ].reduce((promise, config) => {
                    return promise.then(() => {
                        return testScope.updateComponentState({
                            text: config.initialText,
                            tabs: 0
                        }).then(() => {
                            const keyEvent = new KeyboardEvent('keydown', {code: 'Enter'});

                            mockGetSelection.and.returnValue({
                                focusOffset: config.focusOffset,
                                focusNode: config.focusNode()
                            });

                            // test action
                            testScope.component.onKeyPress(keyEvent);

                            // test assertions
                            const addBrickArguments = testScope.getRecentArguments('core2.addBrickAfterBrickId');

                            expect(addBrickArguments[2]).toEqual({
                                text: config.expectedNewText,
                                tabs: testScope.component.state.tabs
                            });

                            expect(testScope.component.scope.text).toEqual(config.expectedFirstText);
                        });
                    });
                }, Promise.resolve());
            }));
        });

        describe('[Top key]', () => {
            it('should focus on previous text Brick', async(() => {
                const mockGetSelection = spyOn(window, 'getSelection');

                // todo: fix that shame
                testScope.mockWallModel.api.ui['mode'] = {
                    edit: {}
                };

                testScope.mockWallModel.api.ui.mode.edit.focusOnPreviousTextBrick = jasmine.createSpy('focusOnPreviousTextBrick');

                testScope.updateComponentState({
                    text: 'initial',
                    tabs: 0
                }).then(() => {
                    const keyEvent = new KeyboardEvent('keydown', {code: 'ArrowUp'});

                    mockGetSelection.and.returnValue({
                        focusOffset: 0,
                        focusNode: testScope.nativeElement.childNodes[0]
                    });

                    // test action
                    testScope.component.onKeyPress(keyEvent);

                    // test assertions
                    const callArguments = (testScope.mockWallModel.api.ui.mode.edit.focusOnPreviousTextBrick as any)
                        .calls.mostRecent().args;

                    expect(testScope.mockWallModel.api.ui.mode.edit.focusOnPreviousTextBrick).toHaveBeenCalled();
                    expect(/* initiator component id = */callArguments[0]).toBe(testScope.component.id);
                    expect(callArguments[1]).toEqual({
                        initiator: FOCUS_INITIATOR,
                        details: {
                            topKey: true,
                            caretLeftCoordinate: 0
                        }
                    });
                });
            }));

            it('should not focus on previous text Brick when cursor is not on first line', async(() => {
                const mockGetSelection = spyOn(window, 'getSelection');


                // todo: fix that shame
                testScope.mockWallModel.api.ui['mode'] = {
                    edit: {}
                };

                testScope.mockWallModel.api.ui.mode.edit.focusOnPreviousTextBrick = jasmine.createSpy('focusOnPreviousTextBrick');

                const newState = {
                    text: 'Long initial text, Long initial text, Long initial text, Long initial text',
                    tabs: 0
                };

                testScope.updateComponentState(newState).then(() => {
                    const keyEvent = new KeyboardEvent('keydown', {code: 'ArrowUp'});

                    mockGetSelection.and.returnValue({
                        focusOffset: newState.text.length - 5,
                        focusNode: testScope.nativeElement.childNodes[0]
                    });

                    // make width narrow so cursor will be not in the first line
                    testScope.nativeElement.style.width = '20px';

                    // test action
                    testScope.component.onKeyPress(keyEvent);

                    // test assertions
                    expect(testScope.mockWallModel.api.ui.mode.edit.focusOnPreviousTextBrick).not.toHaveBeenCalled();
                });
            }));
        });

        describe('[Bottom key]', () => {
            it('should focus on next text Brick', async(() => {
                const mockGetSelection = spyOn(window, 'getSelection');

                // todo: fix that shame
                testScope.mockWallModel.api.ui['mode'] = {
                    edit: {}
                };

                testScope.mockWallModel.api.ui.mode.edit.focusOnNextTextBrick = jasmine.createSpy('focusOnNextTextBrick');

                testScope.updateComponentState({
                    text: 'initial',
                    tabs: 0
                }).then(() => {
                    const keyEvent = new KeyboardEvent('keydown', {code: 'ArrowDown'});

                    mockGetSelection.and.returnValue({
                        focusOffset: 0,
                        focusNode: testScope.nativeElement.childNodes[0]
                    });

                    // test action
                    testScope.component.onKeyPress(keyEvent);

                    // test assertions
                    const callArguments = (testScope.mockWallModel.api.ui.mode.edit.focusOnNextTextBrick as any)
                        .calls.mostRecent().args;

                    expect(testScope.mockWallModel.api.ui.mode.edit.focusOnNextTextBrick).toHaveBeenCalled();
                    expect(/*initiator component id*/callArguments[0]).toBe(testScope.component.id);
                    expect(callArguments[1]).toEqual({
                        initiator: FOCUS_INITIATOR,
                        details: {
                            bottomKey: true,
                            caretLeftCoordinate: 0
                        }
                    });
                });
            }));

            it('should not focus on next text Brick when cursor is not on last line', async(() => {
                const mockGetSelection = spyOn(window, 'getSelection');

                // todo: fix that shame
                testScope.mockWallModel.api.ui['mode'] = {
                    edit: {}
                };

                testScope.mockWallModel.api.ui.mode.edit.focusOnNextTextBrick = jasmine.createSpy('focusOnNextTextBrick');

                const newState = {
                    text: 'Long initial text, Long initial text, Long initial text, Long initial text',
                    tabs: 0
                };

                testScope.updateComponentState(newState).then(() => {
                    const keyEvent = new KeyboardEvent('keydown', {code: 'ArrowDown'});

                    mockGetSelection.and.returnValue({
                        focusOffset: 0,
                        focusNode: testScope.nativeElement.childNodes[0]
                    });

                    // make width narrow so cursor will be not in the first line
                    testScope.nativeElement.style.width = '20px';

                    // test action
                    testScope.component.onKeyPress(keyEvent);

                    // test assertions
                    expect(testScope.mockWallModel.api.ui.mode.edit.focusOnNextTextBrick).not.toHaveBeenCalled();
                });
            }));
        });

        describe('[Left key]', () => {
            it('should navigate to previous text brick', async(() => {
                // todo: fix that shame
                testScope.mockWallModel.api.ui['mode'] = {
                    edit: {}
                };

                testScope.mockWallModel.api.ui.mode.edit.focusOnPreviousTextBrick = jasmine.createSpy('focusOnPreviousTextBrick');

                testScope.updateComponentState({
                    text: 'initial',
                    tabs: 0
                }).then(() => {
                    const keyEvent = new KeyboardEvent('keydown', {code: 'ArrowLeft'});

                    // place caret at first position
                    (new PlaceCaretToPosition(testScope.nativeElement.childNodes[0], /*cursor position*/0)).place();

                    // test action
                    testScope.component.onKeyPress(keyEvent);

                    // test assertions
                    const callArguments = (testScope.mockWallModel.api.ui.mode.edit.focusOnPreviousTextBrick as any)
                        .calls.mostRecent().args;

                    expect(testScope.mockWallModel.api.ui.mode.edit.focusOnPreviousTextBrick).toHaveBeenCalled();

                    expect(callArguments[0]).toBe(testScope.component.id);
                    expect(callArguments[1]).toEqual({
                        initiator: FOCUS_INITIATOR,
                        details: {
                            leftKey: true
                        }
                    });
                });
            }));

            it('should not navigate to previous text brick when cursor is not at the beginning', async(() => {
                // todo: fix that shame
                testScope.mockWallModel.api.ui['mode'] = {
                    edit: {}
                };

                testScope.mockWallModel.api.ui.mode.edit.focusOnPreviousTextBrick = jasmine.createSpy('focusOnPreviousTextBrick');

                testScope.updateComponentState({
                    text: 'initial',
                    tabs: 0
                }).then(() => {
                    const keyEvent = new KeyboardEvent('keydown', {code: 'ArrowLeft'});

                    // place caret at first position
                    (new PlaceCaretToPosition(testScope.nativeElement.childNodes[0], /*cursor position*/1)).place();

                    // test action
                    testScope.component.onKeyPress(keyEvent);

                    // test assertions
                    expect(testScope.mockWallModel.api.ui.mode.edit.focusOnPreviousTextBrick).not.toHaveBeenCalled();
                });
            }));
        });

        describe('[Right key]', () => {
            it('should navigate to next text brick', async(() => {
                // todo: fix that shame
                testScope.mockWallModel.api.ui['mode'] = {
                    edit: {}
                };

                testScope.mockWallModel.api.ui.mode.edit.focusOnNextTextBrick = jasmine.createSpy('focusOnNextTextBrick');

                const newState = {
                    text: 'initial',
                    tabs: 0
                };

                testScope.updateComponentState(newState).then(() => {
                    const keyEvent = new KeyboardEvent('keydown', {code: 'ArrowRight'});

                    // place caret at the end
                    (new PlaceCaretToPosition(
                        testScope.nativeElement.childNodes[0],
                        /*cursor position*/newState.text.length))
                        .place();

                    // test action
                    testScope.component.onKeyPress(keyEvent);

                    // test assertions
                    const callArguments = (testScope.mockWallModel.api.ui.mode.edit.focusOnNextTextBrick as any)
                        .calls.mostRecent().args;

                    expect(testScope.mockWallModel.api.ui.mode.edit.focusOnNextTextBrick).toHaveBeenCalled();

                    expect(callArguments[0]).toBe(testScope.component.id);
                    expect(callArguments[1]).toEqual({
                        initiator: FOCUS_INITIATOR,
                        details: {
                            rightKey: true
                        }
                    });
                });
            }));

            it('should not navigate to next text brick when cursor is not at the end', async(() => {
                // todo: fix that shame
                testScope.mockWallModel.api.ui['mode'] = {
                    edit: {}
                };

                testScope.mockWallModel.api.ui.mode.edit.focusOnNextTextBrick = jasmine.createSpy('focusOnNextTextBrick');

                testScope.updateComponentState({
                    text: 'initial',
                    tabs: 0
                }).then(() => {
                    const keyEvent = new KeyboardEvent('keydown', {code: 'ArrowRight'});

                    // place caret at first position
                    (new PlaceCaretToPosition(
                        testScope.nativeElement.childNodes[0],
                        /*cursor position*/0))
                        .place();

                    // test action
                    testScope.component.onKeyPress(keyEvent);

                    // test assertions
                    expect(testScope.mockWallModel.api.ui.mode.edit.focusOnNextTextBrick).not.toHaveBeenCalled();
                });
            }));
        });

        describe('[Backspace key]', () => {
            it('should delete current brick and focus on previous text brick', async(() => {
                testScope.updateComponentState({
                    text: '',
                    tabs: 0
                }).then(() => {
                    const previousTextBrickId = '2';

                    testScope.mock('core2.getPreviousTextBrickId').and.returnValue(previousTextBrickId);
                    testScope.mock('core2.removeBrick');
                    testScope.mockMethods(['ui.mode.edit.focusOnBrickId']);

                    (new PlaceCaretToPosition(testScope.nativeElement, /*cursor position*/0)).place();

                    // test action
                    testScope.component.onKeyPress(new KeyboardEvent('keydown', {code: 'Backspace'}));

                    // test assertions
                    expect(testScope.mockWallModel.api.core2.getPreviousTextBrickId).toHaveBeenCalled();
                    expect(testScope.mockWallModel.api.core2.removeBrick).toHaveBeenCalled();
                    expect(testScope.mockWallModel.api.ui.mode.edit.focusOnBrickId).toHaveBeenCalled();

                    // test assertions
                    const removeBrickCallArguments = testScope.getRecentArguments('core2.removeBrick');
                    const focusOnBrickIdCallArguments = testScope.getRecentArguments('ui.mode.edit.focusOnBrickId');

                    expect(removeBrickCallArguments[0]).toBe(testScope.component.id);
                    expect(focusOnBrickIdCallArguments[0]).toBe(previousTextBrickId);
                    expect(focusOnBrickIdCallArguments[1]).toEqual({
                        initiator: FOCUS_INITIATOR,
                        details: {
                            deletePreviousText: true
                        }
                    });
                });
            }));

            it('should concat with previous text supporting brick and delete current brick', fakeAsync(() => {
                const newState = {
                    text: 'initial',
                    tabs: 0
                };

                testScope.updateComponentState(newState).then(() => {
                    const previousTextBrickId = '2';
                    const previousTextSupportingBrickSnapshot = {
                        state: {
                            text: 'previous'
                        }
                    };

                    testScope.mock('core2.getPreviousTextBrickId').and.returnValue(previousTextBrickId);
                    testScope.mock('core2.getBrickSnapshot').and.returnValue(previousTextSupportingBrickSnapshot);
                    testScope.mockMethods(['core2.removeBrick', 'ui.mode.edit.focusOnBrickId', 'core2.updateBrickState']);

                    (new PlaceCaretToPosition(testScope.nativeElement, /*cursor position*/0)).place();

                    // test action
                    testScope.component.onKeyPress(new KeyboardEvent('keydown', {code: 'Backspace'}));

                    tick();

                    // test assertions
                    expect(testScope.mockWallModel.api.core2.getPreviousTextBrickId).toHaveBeenCalled();
                    expect(testScope.mockWallModel.api.core2.getBrickSnapshot).toHaveBeenCalled();
                    expect(testScope.mockWallModel.api.core2.updateBrickState).toHaveBeenCalled();
                    expect(testScope.mockWallModel.api.core2.removeBrick).toHaveBeenCalled();
                    expect(testScope.mockWallModel.api.ui.mode.edit.focusOnBrickId).toHaveBeenCalled();

                    // test assertions
                    const removeBrickCallArguments = testScope.getRecentArguments('core2.removeBrick');
                    const focusOnBrickIdCallArguments = testScope.getRecentArguments('ui.mode.edit.focusOnBrickId');
                    const updateBrickStateCallArguments = testScope.getRecentArguments('core2.updateBrickState');

                    expect(removeBrickCallArguments[0]).toBe(testScope.component.id);
                    expect(focusOnBrickIdCallArguments[0]).toBe(previousTextBrickId);
                    expect(focusOnBrickIdCallArguments[1]).toEqual({
                        initiator: FOCUS_INITIATOR,
                        details: {
                            concatText: true,
                            concatenationText: newState.text
                        }
                    });
                    expect(updateBrickStateCallArguments[0]).toBe(previousTextBrickId);
                    expect(updateBrickStateCallArguments[1]).toEqual({
                        text: previousTextSupportingBrickSnapshot.state.text + newState.text
                    });
                });
            }));

            it('should decrease tab', async(() => {
                testScope.updateComponentState({
                    text: 'initial',
                    tabs: 1
                }).then(() => {
                    (new PlaceCaretToPosition(testScope.nativeElement, /*cursor position*/0)).place();

                    let capturedState: IBaseTextState;

                    testScope.component.stateChanges.subscribe((newState) => capturedState = newState);

                    // test action
                    testScope.component.onKeyPress(new KeyboardEvent('keydown', {code: 'Backspace'}));

                    // test assertions
                    expect(capturedState).toEqual({
                        tabs: 0,
                        text: 'initial'
                    });
                });
            }));
        });

        describe('[Delete key]', () => {
            it('should concat with next text supporting brick', async(() => {
                const newState = {
                    text: 'initial',
                    tabs: 0
                };

                testScope.updateComponentState(newState).then(() => {
                    const nextTextBrickId = '2';
                    const nextTextSupportingBrickSnapshot = {
                        id: nextTextBrickId,
                        state: {
                            text: 'previous'
                        }
                    };

                    testScope.mock('core2.getNextTextBrickId').and.returnValue(nextTextBrickId);
                    testScope.mock('core2.getBrickSnapshot').and.returnValue(nextTextSupportingBrickSnapshot);
                    testScope.mockMethods(['core2.removeBrick']);

                    let capturedState;
                    testScope.component.stateChanges.subscribe((updatedState) => capturedState = updatedState);

                    // place caret at the end
                    (new PlaceCaretToPosition(
                        testScope.nativeElement.childNodes[0],
                        /*cursor position*/newState.text.length))
                        .place();

                    // test action
                    testScope.component.onKeyPress(new KeyboardEvent('keydown', {code: 'Delete'}));

                    // test assertions
                    testScope.whenRendering().then(() => {
                        expect(testScope.mockWallModel.api.core2.getNextTextBrickId).toHaveBeenCalled();
                        expect(testScope.mockWallModel.api.core2.getBrickSnapshot).toHaveBeenCalled();
                        expect(testScope.mockWallModel.api.core2.removeBrick).toHaveBeenCalled();

                        // test assertions
                        expect(testScope.getRecentArguments('core2.getNextTextBrickId')[0]).toBe(testScope.component.id);
                        expect(testScope.getRecentArguments('core2.getBrickSnapshot')[0]).toBe(nextTextBrickId);
                        expect(testScope.getRecentArguments('core2.removeBrick')[0])
                            .toBe(nextTextSupportingBrickSnapshot.id);

                        expect(capturedState.text).toBe(newState.text + nextTextSupportingBrickSnapshot.state.text);
                    });
                });
            }));

            it('should set up caret after text concatenation', fakeAsync(() => {
                const mockRange = {
                    setStart: jasmine.createSpy('Range setStart')
                };

                const mockSelection = {
                    removeAllRanges: jasmine.createSpy('removeAllRanges'),
                    addRange: jasmine.createSpy('addRange'),
                };

                // have to mock to check caret position and element
                const mockCreateRangeMethod = spyOn(document, 'createRange');
                mockCreateRangeMethod.and.callThrough();

                // have to mock just to prevent errors
                const mockGetSelectionMethod = spyOn(window, 'getSelection');
                mockGetSelectionMethod.and.callThrough();

                [
                    {
                        initialText: 'initial',
                        nextBrickText: 'foo',
                        caretNode: () => testScope.nativeElement.childNodes[0],
                        caretEndPosition: 7,
                        expectedResultText: 'initialfoo',
                        expectedCaretPosition: 7,
                        expectedCaretNode: () => testScope.nativeElement.childNodes[0]
                    },
                    {
                        initialText: '<b>init</b>ial',
                        nextBrickText: 'foo',
                        caretNode: () => testScope.nativeElement.childNodes[1],
                        caretEndPosition: 3,
                        expectedResultText: '<b>init</b>ialfoo',
                        expectedCaretPosition: 3,
                        expectedCaretNode: () => testScope.nativeElement.childNodes[1]
                    },
                    {
                        initialText: 'init<b>ial</b>',
                        nextBrickText: 'foo',
                        caretNode: () => testScope.nativeElement.childNodes[1].childNodes[0],
                        caretEndPosition: 3,
                        expectedResultText: 'init<b>ial</b>foo',
                        expectedCaretPosition: 0,
                        expectedCaretNode: () => testScope.nativeElement.childNodes[2]
                    },
                    {
                        initialText: 'init<b>ial</b>',
                        nextBrickText: '<b>foo</b>',
                        caretNode: () => testScope.nativeElement.childNodes[1].childNodes[0],
                        caretEndPosition: 3,
                        expectedResultText: 'init<b>ial</b><b>foo</b>',
                        expectedCaretPosition: 0,
                        expectedCaretNode: () => testScope.nativeElement.childNodes[2].childNodes[0]
                    },
                    {
                        initialText: 'initial',
                        nextBrickText: '<b>foo</b>',
                        caretNode: () => testScope.nativeElement.childNodes[0],
                        caretEndPosition: 7,
                        expectedResultText: 'initial<b>foo</b>',
                        expectedCaretPosition: 0,
                        expectedCaretNode: () => testScope.nativeElement.childNodes[1].childNodes[0]
                    }
                ].reduce((promise, testCase) => {
                    return promise.then(() => {
                        return testScope.updateComponentState({
                            text: testCase.initialText,
                            tabs: 0
                        }).then(() => {
                            const nextTextBrickId = '2';
                            const nextTextSupportingBrickSnapshot = {
                                id: nextTextBrickId,
                                state: {
                                    text: testCase.nextBrickText
                                }
                            };

                            testScope.mock('core2.getNextTextBrickId').and.returnValue(nextTextBrickId);
                            testScope.mock('core2.getBrickSnapshot').and.returnValue(nextTextSupportingBrickSnapshot);
                            testScope.mockMethods(['core2.removeBrick']);

                            // place caret at the end
                            (new PlaceCaretToPosition(
                                testCase.caretNode(),
                                testCase.caretEndPosition))
                                .place();

                            let capturedState;
                            testScope.component.stateChanges.subscribe((updatedState) => {
                                capturedState = updatedState;
                            });

                            // test action
                            testScope.component.onKeyPress(new KeyboardEvent('keydown', {code: 'Delete'}));

                            // test assertions
                            return testScope.whenRendering().then(() => {
                                mockCreateRangeMethod.and.returnValue(mockRange);
                                mockGetSelectionMethod.and.returnValue(mockSelection);

                                tick(100);

                                expect(capturedState.text).toBe(testCase.expectedResultText);

                                expect(mockRange.setStart).toHaveBeenCalled();

                                const createRangeArguments = mockRange.setStart.calls.mostRecent().args;

                                expect(createRangeArguments[0]).toBe(testCase.expectedCaretNode());
                                expect(createRangeArguments[1]).toBe(testCase.expectedCaretPosition);

                                mockCreateRangeMethod.and.callThrough();
                                mockGetSelectionMethod.and.callThrough();
                            });
                        });
                    });
                }, Promise.resolve());
            }));

            it('should delete current brick and focus to next brick', async(() => {
                const newState = {
                    text: '',
                    tabs: 0
                };

                testScope.updateComponentState(newState).then(() => {
                    const nextTextBrickId = '2';
                    testScope.mock('core2.getNextTextBrickId').and.returnValue(nextTextBrickId);
                    testScope.mockMethods(['core2.removeBrick', 'ui.mode.edit.focusOnBrickId']);

                    // place caret at the start
                    (new PlaceCaretToPosition(testScope.nativeElement, 0)).place();

                    // test action
                    testScope.component.onKeyPress(new KeyboardEvent('keydown', {code: 'Delete'}));

                    // test assertions
                    testScope.whenRendering().then(() => {
                        expect(testScope.mockWallModel.api.core2.getNextTextBrickId).toHaveBeenCalled();
                        expect(testScope.mockWallModel.api.core2.removeBrick).toHaveBeenCalled();
                        expect(testScope.mockWallModel.api.ui.mode.edit.focusOnBrickId).toHaveBeenCalled();

                        // test assertions
                        expect(testScope.getRecentArguments('core2.getNextTextBrickId')[0]).toBe(testScope.component.id);
                        expect(testScope.getRecentArguments('core2.removeBrick')[0]).toBe(testScope.component.id);
                        expect(testScope.getRecentArguments('ui.mode.edit.focusOnBrickId')[0]).toBe(nextTextBrickId);
                        expect(testScope.getRecentArguments('ui.mode.edit.focusOnBrickId')[1]).toEqual({
                            initiator: FOCUS_INITIATOR,
                            details: {
                                deletePreviousText: true
                            }
                        });
                    });
                });
            }));

            it('should not delete current brick if there is any next text brick', async(() => {
                const newState = {
                    text: '',
                    tabs: 0
                };

                testScope.updateComponentState(newState).then(() => {
                    const nextTextBrickId = null;
                    testScope.mock('core2.getNextTextBrickId').and.returnValue(nextTextBrickId);
                    testScope.mockMethods(['ui.removeBrick', 'ui.focusOnBrickId']);

                    // place caret at the start
                    (new PlaceCaretToPosition(testScope.nativeElement, 0)).place();

                    // test action
                    testScope.component.onKeyPress(new KeyboardEvent('keydown', {code: 'Delete'}));

                    // test assertions
                    testScope.whenRendering().then(() => {
                        expect(testScope.mockWallModel.api.core2.getNextTextBrickId).toHaveBeenCalled();
                        expect(testScope.mockWallModel.api.ui.removeBrick).not.toHaveBeenCalled();
                        expect(testScope.mockWallModel.api.ui.focusOnBrickId).not.toHaveBeenCalled();

                        // test assertions
                        expect(testScope.getRecentArguments('core2.getNextTextBrickId')[0]).toBe(testScope.component.id);
                    });
                });
            }));
        });

        describe('[Tab key]', () => {
            it('should add tab', async(() => {
                testScope.updateComponentState({
                    text: 'initial',
                    tabs: 0
                }).then(() => {
                    let capturedState;
                    testScope.component.stateChanges.subscribe((updatedState) => capturedState = updatedState);

                    // place caret at the start
                    (new PlaceCaretToPosition(
                        testScope.nativeElement.childNodes[0], 0))
                        .place();

                    // test action
                    testScope.component.onKeyPress(new KeyboardEvent('keydown', {code: 'Tab'}));

                    // test assertions
                    expect(capturedState.tabs).toBe(1);
                });
            }));

            it('should not add tab if caret is not at the start position', async(() => {
                testScope.updateComponentState({
                    text: 'initial',
                    tabs: 0
                }).then(() => {
                    let capturedState;
                    testScope.component.stateChanges.subscribe((updatedState) => capturedState = updatedState);

                    // place caret not at the start
                    (new PlaceCaretToPosition(
                        testScope.nativeElement.childNodes[0], 1))
                        .place();

                    // test action
                    testScope.component.onKeyPress(new KeyboardEvent('keydown', {code: 'Tab'}));

                    // test assertions
                    expect(capturedState).not.toBeDefined();
                    expect(testScope.component.state.tabs).toBe(0);
                });
            }));
        });
    });

    describe('onWallFocus()', () => {
        let mockRange;

        beforeEach(() => {
            // set the activeElement back to the default
            (document.activeElement as HTMLElement).blur();

            mockRange = {
                setStart: jasmine.createSpy('setStart')
            };

            spyOn(document, 'createRange').and.returnValue(mockRange);

            spyOn(window, 'getSelection').and.returnValue({
                removeAllRanges: jasmine.createSpy('removeAllRanges'),
                addRange: jasmine.createSpy('addRange'),
            });
        });

        it('should focus on the node if there API call', () => {
            spyOn(testScope.nativeElement, 'focus');

            testScope.component.onWallFocus();

            expect(testScope.nativeElement.focus).toHaveBeenCalled();
        });

        it('should place caret at the end when previous text brick was deleted', () => {
            testScope.component.onWallFocus({
                initiator: FOCUS_INITIATOR,
                details: {
                    deletePreviousText: true
                }
            });

            const createRangeArguments = mockRange.setStart.calls.mostRecent().args;

            expect(mockRange.setStart).toHaveBeenCalled();
            expect(createRangeArguments[0]).toBe(testScope.nativeElement.childNodes[0]);
            expect(createRangeArguments[1]).toBe(7);
        });

        it('should place caret at the end after left key pressed', () => {
            testScope.component.onWallFocus({
                initiator: FOCUS_INITIATOR,
                details: {
                    leftKey: true
                }
            });

            const createRangeArguments = mockRange.setStart.calls.mostRecent().args;

            expect(mockRange.setStart).toHaveBeenCalled();
            expect(createRangeArguments[0]).toBe(testScope.nativeElement.childNodes[0]);
            expect(createRangeArguments[1]).toBe(7);
        });

        it('should place caret at the start after right key pressed', () => {
            testScope.component.onWallFocus({
                initiator: FOCUS_INITIATOR,
                details: {
                    rightKey: true
                }
            });

            const createRangeArguments = mockRange.setStart.calls.mostRecent().args;

            expect(mockRange.setStart).toHaveBeenCalled();
            expect(createRangeArguments[0]).toBe(testScope.nativeElement.childNodes[0]);
            expect(createRangeArguments[1]).toBe(0);
        });

        it('should place caret based on concatenated text', async(() => {
            [
                {
                    initialText: 'init',
                    concatenatedText: 'ial',
                    expectedFocusNode: () => testScope.nativeElement.childNodes[0],
                    expectedCaretPosition: 4
                },
                {
                    initialText: 'initial',
                    concatenatedText: '<b>concatenated</b>',
                    expectedFocusNode: () => testScope.nativeElement.childNodes[1].childNodes[0],
                    expectedCaretPosition: 0
                }
                ,
                {
                    initialText: '<b>initial</b>',
                    concatenatedText: '<b>concatenated</b>',
                    expectedFocusNode: () => testScope.nativeElement.childNodes[1].childNodes[0],
                    expectedCaretPosition: 0
                }
            ].reduce((promise, testCase) => {
                return promise.then(() => {
                    return testScope.updateComponentState({
                        text: `${testCase.initialText}${testCase.concatenatedText}`,
                        tabs: 0
                    }).then(() => {
                        // set the activeElement back to the default
                        (document.activeElement as HTMLElement).blur();

                        testScope.component.onWallFocus({
                            initiator: FOCUS_INITIATOR,
                            details: {
                                concatText: true,
                                concatenationText: testCase.concatenatedText
                            }
                        });

                        const createRangeArguments = mockRange.setStart.calls.mostRecent().args;

                        expect(mockRange.setStart).toHaveBeenCalled();
                        expect(createRangeArguments[0]).toBe(testCase.expectedFocusNode());
                        expect(createRangeArguments[1]).toBe(testCase.expectedCaretPosition);
                    });
                });
            }, Promise.resolve());
        }));

        it('should place caret at the start if bottom key was pressed', async(() => {
            testScope.component.onWallFocus({
                initiator: FOCUS_INITIATOR,
                details: {
                    bottomKey: true
                }
            });

            const createRangeArguments = mockRange.setStart.calls.mostRecent().args;

            expect(mockRange.setStart).toHaveBeenCalled();
            expect(createRangeArguments[0]).toBe(testScope.nativeElement.childNodes[0]);
            expect(createRangeArguments[1]).toBe(0);
        }));

        it('should place caret at the end if top key was pressed', async(() => {
            testScope.component.onWallFocus({
                initiator: FOCUS_INITIATOR,
                details: {
                    topKey: true
                }
            });

            const createRangeArguments = mockRange.setStart.calls.mostRecent().args;

            expect(mockRange.setStart).toHaveBeenCalled();
            expect(createRangeArguments[0]).toBe(testScope.nativeElement.childNodes[0]);
            expect(createRangeArguments[1]).toBe(7);
        }));
    });

    describe('[TextContextMenuComponent]', () => {
        // test all interaction with TextContextMenuComponent there
        // TextContextMenuComponent component will be tested separately
    });

    describe('[BricksListComponent]', () => {
        // test all interaction with BricksListComponent there
        // BricksListComponent component will be tested separately
    });
});
