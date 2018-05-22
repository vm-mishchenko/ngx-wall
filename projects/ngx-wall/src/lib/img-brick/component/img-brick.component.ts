import {Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {FileUploaderService} from '../../modules/file-uploader/file-uploader.service';
import {ContextModalService} from '../../modules/modal';
import {IResizeData} from '../../modules/resizable/resizable.directive';
import {Base64ToFile} from '../../modules/utils/base64-to-file';
import {Guid} from '../../modules/utils/guid';
import {ImgEncoder} from '../../modules/utils/img-encoder.service';
import {IOnWallFocus, WallApi} from '../../wall';
import {ImgBrickState} from '../img-brick-state.interface';
import {InputContextComponent} from './input-context.component';

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
        metadata: null,
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
                private fileUploader: FileUploaderService,
                private renderer: Renderer2,
                private el: ElementRef) {
    }

    ngOnInit() {
        Object.assign(this.scope, this.state);

        this.processNewState();
    }

    onWallStateChange(newState: ImgBrickState) {
        if (newState && newState.src !== this.scope.src) {
            Object.assign(this.scope, this.state);

            this.processNewState();
        }
    }

    processNewState() {
        if (this.scope.src) {
            if (!this.scope.width) {
                this.setUpImageWidth();
            }

            if (this.isBase64(this.scope.src)) {
                this.processBase64ImgSrc();
            }
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

    applyImageSrc(imageSrc: string, metadata?: any): Promise<any> {
        return this.isImage(imageSrc)
            .then(() => {
                this.scope.src = imageSrc;

                if (metadata) {
                    this.scope.metadata = metadata;
                }

                this.save();

                return this.setUpImageWidth();
            })
            .catch(() => {
                alert('Please enter valid url');
            });
    }

    applyImageFile(imgFile: File): Promise<void> {
        return (new ImgEncoder(imgFile)).getBase64Representation().then((imgBase64) => {
            return this.applyImageSrc(imgBase64).then(() => {
                return this.processBase64ImgSrc();
            });
        });
    }

    processBase64ImgSrc(): Promise<void> {
        return this.uploadImage().then((uploadInfo) => {
            return this.applyImageSrc(uploadInfo.fileUrl, uploadInfo.metadata);
        }, () => {
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

            if (result.src) {
                this.applyImageSrc(result.src);
            } else {
                this.applyImageFile(result.file);
            }
        }, () => {
            this.imageSrcPlaceholderRef = null;
        });
    }

    isBase64(str: string) {
        str = str.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');

        try {
            return btoa(atob(str)) === str;
        } catch (err) {
            return false;
        }
    }

    private uploadImage(): Promise<{ fileUrl: string, metadata: any }> {
        return new Promise((resolve, reject) => {
            if (this.fileUploader.canUploadFile()) {
                const imgReference = this.fileUploader.getFileReference(`img-brick/${(new Guid()).get()}`);

                const imgFile = (new Base64ToFile(this.scope.src, `${imgReference}`)).getFile();

                this.fileUploader.upload(imgReference, imgFile)
                    .snapshotChanges()
                    .subscribe((snapshot) => {
                        resolve({
                            fileUrl: snapshot.downloadURL,
                            metadata: {
                                reference: imgReference
                            }
                        });
                    }, reject);
            } else {
                reject(new Error('File uploader service does not allow upload file'));
            }
        });
    }

    private setUpImageWidth(): Promise<void> {
        return this.loadImage(this.scope.src).then(() => {
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
