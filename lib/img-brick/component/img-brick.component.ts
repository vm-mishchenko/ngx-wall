import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { IOnWallFocus, WallApi } from '../../index';
import { ContextModalService } from '../../modules/modal';
import { IResizeData } from '../../modules/resizable/resizable.directive';
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

    @ViewChild('image') image: ElementRef;

    scope: ImgBrickState = {
        src: '',
        width: null
    };

    lastWidth: number;

    imageSrcPlaceholderRef: NgbModalRef;

    resizable = {
        resize: this.onResize.bind(this),
        resizeStart: this.onResizeStart.bind(this),
        resizeEnd: this.onResizeEnd.bind(this)
    };

    constructor(private wallApi: WallApi,
                private contextModalService: ContextModalService,
                private renderer: Renderer2,
                private el: ElementRef) {
    }

    ngOnInit() {
        Object.assign(this.scope, this.state);

        if (this.scope.src && !this.scope.width) {
            this.setUpImageWidth();
        }
    }

    onWallStateChange(newState: ImgBrickState) {
        if (newState && newState.src !== this.scope.src) {
            Object.assign(this.scope, this.state);
        }
    }

    onWallFocus(): void {
        if (!this.scope.src) {
            setTimeout(() => {
                this.showPanel();
            }, 0);
        }
    }

    // resize callbacks
    onResize(resizeData: IResizeData) {
        this.scope.width = this.lastWidth + resizeData.offset;
    }

    onResizeStart() {
        this.lastWidth = this.scope.width;
    }

    onResizeEnd() {
        this.save();
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

                this.setUpImageWidth();
            })
            .catch(() => {
                alert('Please enter valid url');
            });
    }

    showPanel() {
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

    private setUpImageWidth() {
        this.loadImage(this.scope.src).then(() => {
            this.scope.width = this.image.nativeElement.width;

            this.save();
        });
    }

    private save() {
        this.stateChanges.emit(this.scope);
    }

    private loadImage(src: string) {
        return this.isImage(src);
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
