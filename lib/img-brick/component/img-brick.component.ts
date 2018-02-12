import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { IOnWallFocus, WallApi } from '../../index';
import { ContextModalService } from '../../modules/modal';
import { ImgBrickState } from '../img-brick-state.interface';
import { InputContextComponent } from './input-context.component';

@Component({
    selector: 'img-brick',
    templateUrl: './img-brick.component.html'
})
export class ImgBrickComponent implements OnInit, IOnWallFocus {
    @Input() id: string;
    @Input() state: ImgBrickState;

    @Output() stateChanges: EventEmitter<ImgBrickState> = new EventEmitter();

    @ViewChild('src') src: ElementRef;

    // data
    scope: ImgBrickState = {
        src: ''
    };

    // ui
    uiStates: any = {
        initial: 'initial',
        image: 'image'
    };

    uiState: string = this.uiStates.initial;

    imageSrcPlaceholderRef: NgbModalRef;

    constructor(private wallApi: WallApi, private contextModalService: ContextModalService, private el: ElementRef) {
    }

    ngOnInit() {
        if (this.state && this.state.src !== this.scope.src) {
            this.scope.src = this.state.src;

            if (this.scope.src) {
                this.uiState = this.uiStates.image;
            }
        }
    }

    onWallStateChange(newState: ImgBrickState) {
        if (newState && newState.src !== this.scope.src) {
            this.scope.src = newState.src;

            if (this.scope.src) {
                this.src.nativeElement.value = this.scope.src;

                this.uiState = this.uiStates.image;
            }
        }
    }

    onWallFocus(): void {
        if (this.uiState === this.uiStates.initial && !this.imageSrcPlaceholderRef) {
            setTimeout(() => {
                this.showImagePanel();
            }, 0);
        }
    }

    onImageClick(e) {
        e.stopPropagation();

        this.wallApi.core.selectBrick(this.id);
    }

    applyImageSrc(imageSrc: string) {
        this.isImage(imageSrc)
            .then(() => {
                this.scope.src = imageSrc;

                this.save();

                this.uiState = this.uiStates.image;
            })
            .catch(() => {
                alert('Please enter valid url');
            });
    }

    showImagePanel() {
        this.imageSrcPlaceholderRef = this.contextModalService.open({
            component: InputContextComponent,
            context: {
                relative: {
                    nativeElement: this.el.nativeElement
                }
            }
        });

        this.imageSrcPlaceholderRef.result.then((result) => {
            this.imageSrcPlaceholderRef = null;

            this.applyImageSrc(result.src);
        }, () => {
            this.imageSrcPlaceholderRef = null;
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
}
