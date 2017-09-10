import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {onWallFocus, WallApi} from '../../index';

@Component({
    selector: 'img-brick',
    templateUrl: './img-brick.component.html'
})
export class ImgBrickComponent implements OnInit, onWallFocus {
    @Input() id: string;

    @ViewChild('src') src: ElementRef;

    // data
    state: any = {};

    store: any = null;

    // ui
    uiStates: any = {
        initial: 'initial',
        pasteSrc: 'pasteSrc',
        image: 'image'
    };

    uiState: string = this.uiStates.initial;

    constructor(private wallApi: WallApi) {
    }

    ngOnInit() {
        this.store = this.wallApi.core.getBrickStore(this.id);

        this.state = this.store.get();

        this.state.src = this.state.src || '';

        if (this.state.src) {
            this.src.nativeElement.value = this.state.src;

            this.uiState = this.uiStates.image;
        }
    }

    onWallFocus(): void {
        console.log('onWallFocus');

        if (this.uiState === this.uiStates.initial) {
            this.showImagePanel();
        }
    }

    onKeyPress(e: any) {
        if (e.key === 'Escape') {
            if (this.uiState === this.uiStates.pasteSrc) {
                this.uiState = this.uiStates.initial;
            }
        }

        if (e.key === 'Enter') {
            e.preventDefault();

            this.applyImageSrc()
                .then(() => {
                    this.wallApi.core.addBrickAfterInNewRow(this.id, 'text');
                }).catch(() => {
                this.wallApi.core.addBrickAfterInNewRow(this.id, 'text');
            });
        }
    }

    onImageClick(e) {
        // disable onFocus handler
        e.stopPropagation();

        this.wallApi.core.selectBrick(this.id);
    }

    applyImageSrc() {
        const currentValue = this.getCurrentInputValue();

        this.uiState = this.uiStates.initial;

        return this.isImage(currentValue)
            .then(() => {
                this.state.src = currentValue;

                this.save();

                this.uiState = this.uiStates.image;
            })
            .catch(() => {
                alert('Please enter valid url');
            });
    }

    switchImagePanel() {
        if (this.uiState === this.uiStates.initial) {
            this.showImagePanel();
        } else if (this.uiState === this.uiStates.pasteSrc) {
            this.uiState = this.uiStates.initial;
        }
    }

    showImagePanel() {
        this.uiState = this.uiStates.pasteSrc;

        setTimeout(() => {
            this.src.nativeElement.focus();
        });
    }

    private save() {
        this.store.set(this.state);
    }

    private isImage(src): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = function () {
                resolve();
            };

            img.onerror = function () {
                reject();
            };

            img.src = src;
        });
    }

    private getCurrentInputValue() {
        return this.src.nativeElement.value;
    }
}