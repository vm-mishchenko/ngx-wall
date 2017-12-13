import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { IOnWallFocus, WallApi } from '../../index';
import { ImgBrickState } from '../img-brick-state.interface';

@Component({
    selector: 'img-brick',
    templateUrl: './img-brick.component.html'
})
export class ImgBrickComponent implements OnInit, IOnWallFocus {
    @Input() id: string;
    @Input() state: Observable<ImgBrickState | null>;

    @Output() stateChanges: EventEmitter<ImgBrickState> = new EventEmitter();

    @ViewChild('src') src: ElementRef;

    // data
    scope: ImgBrickState = {
        src: ''
    };

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
        this.state.subscribe((newState) => {
            if (newState && newState.src !== this.scope.src) {
                this.scope.src = newState.src;

                if (this.scope.src) {
                    this.src.nativeElement.value = this.scope.src;

                    this.uiState = this.uiStates.image;
                }
            }
        });
    }

    onWallFocus(): void {
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
                    this.wallApi.core.addBrickAfterBrickId(this.id, 'text');
                })
                .catch(() => {
                    this.wallApi.core.addBrickAfterBrickId(this.id, 'text');
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
                this.scope.src = currentValue;

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
        this.stateChanges.emit(this.scope);
    }

    private isImage(src): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                resolve();
            };

            img.onerror = () => {
                reject();
            };

            img.src = src;
        });
    }

    private getCurrentInputValue() {
        return this.src.nativeElement.value;
    }
}
