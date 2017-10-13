import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { onWallFocus, WallApi } from '../../index';
import { Subject } from "rxjs/Subject";

@Component({
    selector: 'video-brick',
    templateUrl: './video-brick.component.html'
})
export class VideoBrickComponent implements OnInit, onWallFocus {
    @Input() id: string;

    @ViewChild('src') src: ElementRef;
    @ViewChild('iframe') iframe: ElementRef;

    // ui
    uiStates: any = {
        initial: 'initial',
        pasteSrc: 'pasteSrc',
        video: 'video'
    };

    // data
    state: any = {};

    store: any = null;

    uiState: string = this.uiStates.initial;

    constructor(private wallApi: WallApi, private r: Renderer2) {
    }

    ngOnInit() {
        this.store = this.wallApi.core.getBrickStore(this.id);

        this.updateState(this.store.get());

        if (this.state.src) {
            this.uiState = this.uiStates.video;

            setTimeout(() => {
                this.r.setAttribute(this.iframe.nativeElement, 'src', this.state.src);
            }, 10);
        }

        const state = {
            environment: 'mobile',
            isMediaInteractionEnabled: false
        };
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
                this.state.src = `https://www.youtube.com/embed/${youtubeId}`;

                this.r.setAttribute(this.iframe.nativeElement, 'src', this.state.src);

                this.save();

                this.uiState = this.uiStates.video;

                isSuccess = true;
            }
        }

        return isSuccess;
    }

    private save() {
        this.store.set(this.state);
    }

    private getCurrentInputValue() {
        return this.src.nativeElement.value;
    }
}