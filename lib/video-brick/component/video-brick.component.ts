import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { onWallFocus, WallApi } from '../../index';

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

        console.log(this.state);

        if (this.state.src) {
            this.uiState = this.uiStates.video;

            setTimeout(() => {
                this.r.setAttribute(this.iframe.nativeElement, 'src', this.state.src);
            }, 10);
        }
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

            this.applySrc()
                .then(() => {
                    this.wallApi.core.addBrickAfterBrickId(this.id, 'text');
                }).catch(() => {
                this.wallApi.core.addBrickAfterBrickId(this.id, 'text');
            });
        }
    }

    applySrc() {
        const currentValue = this.getCurrentInputValue();

        this.uiState = this.uiStates.initial;

        return this.isVideo(currentValue)
            .then(() => {
                this.state.src = currentValue;

                this.r.setAttribute(this.iframe.nativeElement, 'src', this.state.src);

                this.save();

                this.uiState = this.uiStates.video;
            })
            .catch(() => {
                alert('Please enter valid url');
            });
    }

    private save() {
        this.store.set(this.state);
    }

    private isVideo(src): Promise<boolean> {
        return Promise.resolve(true);
    }

    private getCurrentInputValue() {
        return this.src.nativeElement.value;
    }
}