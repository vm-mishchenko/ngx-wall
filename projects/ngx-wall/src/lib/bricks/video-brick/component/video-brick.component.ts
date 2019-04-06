import {Component, ComponentFactoryResolver, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {StickyModalRef, StickyModalService, StickyPositionStrategy} from 'ngx-sticky-modal';
import {IOnWallFocus} from '../../../wall/wall';
import {IVideoBrickState} from '../video-brick-state.interface';
import {InputContextComponent} from '../input-context/input-context.component';

@Component({
    selector: 'video-brick',
    templateUrl: './video-brick.component.html',
    styleUrls: ['./video-brick.component.scss']
})
export class VideoBrickComponent implements OnInit, IOnWallFocus {
    @Input() id: string;
    @Input() state: IVideoBrickState;

    @Output() stateChanges: EventEmitter<IVideoBrickState> = new EventEmitter();

    @ViewChild('iframe') iframe: ElementRef;

    // ui
    uiStates: any = {
        initial: 'initial',
        video: 'video'
    };

    uiState: string = this.uiStates.initial;

    scope: IVideoBrickState = {
        src: ''
    };

    videoSrcPlaceholderRef: StickyModalRef;

    constructor(private renderer2: Renderer2,
                private el: ElementRef,
                private componentFactoryResolver: ComponentFactoryResolver,
                private ngxStickyModalService: StickyModalService) {
    }

    ngOnInit() {
        if (this.state && this.state.src !== this.scope.src) {
            this.scope.src = this.state.src;

            if (this.scope.src) {
                this.uiState = this.uiStates.video;

                setTimeout(() => {
                    this.renderer2.setAttribute(this.iframe.nativeElement, 'src', this.scope.src);
                }, 10);
            }
        }
    }

    onWallStateChange(newState: IVideoBrickState) {
        if (newState && newState.src !== this.scope.src) {
            this.scope.src = newState.src;

            if (this.scope.src) {
                this.uiState = this.uiStates.video;

                setTimeout(() => {
                    this.renderer2.setAttribute(this.iframe.nativeElement, 'src', this.scope.src);
                }, 10);
            }
        }
    }

    onWallFocus(): void {
        if (this.uiState === this.uiStates.initial && !this.videoSrcPlaceholderRef) {
            setTimeout(() => {
                this.showVideoPanel();
            }, 0);
        }
    }

    applySrc(src: string) {
        this.uiState = this.uiStates.initial;

        if (src.length) {
            const srcArray = src.split('=');
            const youtubeId = srcArray[1];

            if (youtubeId) {
                this.scope.src = `https://www.youtube.com/embed/${youtubeId}`;

                this.renderer2.setAttribute(this.iframe.nativeElement, 'src', this.scope.src);

                this.save();

                this.uiState = this.uiStates.video;
            }
        }
    }

    showVideoPanel() {
        this.videoSrcPlaceholderRef = this.ngxStickyModalService.open({
            component: InputContextComponent,
            positionStrategy: {
                name: StickyPositionStrategy.flexibleConnected,
                options: {
                    relativeTo: this.el.nativeElement
                }
            },
            position: {
                originX: 'center',
                originY: 'bottom',
                overlayX: 'center',
                overlayY: 'top'
            },
            componentFactoryResolver: this.componentFactoryResolver
        });

        this.videoSrcPlaceholderRef.result.then((result) => {
            this.videoSrcPlaceholderRef = null;

            this.applySrc(result.src);
        }, () => {
            this.videoSrcPlaceholderRef = null;
        });
    }

    private save() {
        this.stateChanges.emit(this.scope);
    }
}
