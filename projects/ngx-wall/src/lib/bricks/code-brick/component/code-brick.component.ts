import {Component, ComponentFactoryResolver, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/xml/xml';
import {StickyModalService, StickyPositionStrategy} from 'ngx-sticky-modal';
import {DEFAULT_THEME, SUPPORTED_MODES} from '../code-brick.constant';
import {ModeListComponent} from '../mode-list/mode-list.component';

export interface ICodeBrickState {
    code: string;
    mode: string;
}

@Component({
    selector: 'code-brick',
    templateUrl: './code-brick.component.html',
    styleUrls: ['./code-brick.component.scss']
})
export class CodeBrickComponent implements OnInit {
    scope: ICodeBrickState = {
        code: '',
        mode: SUPPORTED_MODES[0].value
    };

    ui: {
        displayModeName: string;
    } = {
        displayModeName: SUPPORTED_MODES[0].name
    };

    codeMirrorInstance: any;

    @Input() id: string;
    @Input() state: ICodeBrickState;
    @ViewChild('container', {read: ElementRef}) container: ElementRef;
    @ViewChild('mode', {read: ElementRef}) mode: ElementRef;

    @Output() stateChanges: EventEmitter<ICodeBrickState> = new EventEmitter();

    constructor(private ngxStickyModalService: StickyModalService,
                private componentFactoryResolver: ComponentFactoryResolver) {
    }

    ngOnInit() {
        Object.assign(this.scope, this.state);

        this.codeMirrorInstance = CodeMirror(this.container.nativeElement, {
            value: ``,
            mode: this.scope.mode,
            theme: DEFAULT_THEME,
            dragDrop: false,
            scrollbarStyle: null
        });

        this.codeMirrorInstance.on('change', () => {
            this.scope.code = this.codeMirrorInstance.getValue();

            this.saveState();
        });

        this.processNewState();
    }

    onWallStateChange(newState: ICodeBrickState) {
        if (newState && newState.code !== this.scope.code) {
            Object.assign(this.scope, this.state);

            this.processNewState();
        }
    }

    processNewState() {
        this.codeMirrorInstance.setValue(this.scope.code);

        if (this.scope.mode !== this.codeMirrorInstance.getMode().name) {
            this.codeMirrorInstance.setOption('mode', this.scope.mode);
        }

        this.ui.displayModeName = SUPPORTED_MODES.find((mode) => mode.value === this.scope.mode).name;
    }

    saveState() {
        this.stateChanges.emit(this.scope);
    }

    onModeSelected() {
        const elementBoundingRect = this.mode.nativeElement.getBoundingClientRect();

        const modes: any[] = SUPPORTED_MODES.map((mode) => {
            return {
                ...mode,
                selected: mode.value === this.scope.mode
            };
        });

        this.ngxStickyModalService.open({
            component: ModeListComponent,
            data: {modes},
            positionStrategy: {
                name: StickyPositionStrategy.coordinate,
                options: {
                    clientX: elementBoundingRect.x,
                    clientY: elementBoundingRect.y + 35
                }
            },
            componentFactoryResolver: this.componentFactoryResolver
        }).result.then((mode: any) => {
            Object.assign(this.scope, {
                ...this.state,
                mode: mode.value
            });

            this.processNewState();
        }, () => {
            // nothing
        });
    }
}
