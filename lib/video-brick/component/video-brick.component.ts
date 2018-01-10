import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { onWallFocus, WallApi } from '../../index';
import { VideoBrickState } from "../video-brick-state.interface";

@Component({
    selector: 'video-brick',
    templateUrl: './video-brick.component.html'
})
export class VideoBrickComponent implements OnInit, onWallFocus {
    @Input() id: string;

    @Input() state: Observable<VideoBrickState | null>;
    @Output() stateChanges: EventEmitter<VideoBrickState> = new EventEmitter();

    @ViewChild('src') src: ElementRef;
    @ViewChild('iframe') iframe: ElementRef;

    // ui
    uiStates: any = {
        initial: 'initial',
        pasteSrc: 'pasteSrc',
        video: 'video'
    };
    uiState: string = this.uiStates.initial;

    scope: VideoBrickState = {
        src: ''
    };

    constructor(private wallApi: WallApi, private r: Renderer2) {
    }

    ngOnInit() {
        this.state.subscribe((newState) => {
            if (newState && newState.src !== this.scope.src) {
                this.scope.src = newState.src;

                if (this.scope.src) {
                    this.uiState = this.uiStates.video;

                    setTimeout(() => {
                        this.r.setAttribute(this.iframe.nativeElement, 'src', this.scope.src);
                    }, 10);
                }
            }
        });
    }

    onWallFocus(): void {
        if (this.uiState === this.uiStates.initial) {
            this.showPanel();
        }
    }

    updateState(newState) {
        this.state = newState;
    }

    switchPanel() {
        if (this.uiState === this.uiStates.initial) {
            this.showPanel();
        } else if (this.uiState === this.uiStates.pasteSrc) {
            this.uiState = this.uiStates.initial;
        }
    }

    showPanel() {
        this.uiState = this.uiStates.pasteSrc;

        setTimeout(() => {
            this.src.nativeElement.focus();
        });
    }

    onKeyPress(e: any) {
        if (e.key === 'Escape') {
            if (this.uiState === this.uiStates.pasteSrc) {
                this.uiState = this.uiStates.initial;
            }
        }

        if (e.key === 'Enter') {
            e.preventDefault();

            if (this.applySrc()) {
                this.wallApi.core.addBrickAfterBrickId(this.id, 'text');
            }
        }
    }

    applySrc() {
        let isSuccess = false;

        const currentValue = this.getCurrentInputValue();

        this.uiState = this.uiStates.initial;

        if (currentValue.length) {
            const srcArray = currentValue.split('=');
            const youtubeId = srcArray[1];

            if (youtubeId) {
                this.scope.src = `https://www.youtube.com/embed/${youtubeId}`;

                this.r.setAttribute(this.iframe.nativeElement, 'src', this.scope.src);

                this.save();

                this.uiState = this.uiStates.video;

                isSuccess = true;
            }
        }

        return isSuccess;
    }

    private save() {
        this.stateChanges.emit(this.scope);
    }

    private getCurrentInputValue() {
        return this.src.nativeElement.value;
    }
}