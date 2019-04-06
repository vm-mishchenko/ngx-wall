import {
    Component,
    ComponentFactoryResolver,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnInit,
    Output,
    Renderer2,
    ViewChild
} from '@angular/core';
import {StickyModalRef, StickyModalService, StickyPositionStrategy} from 'ngx-sticky-modal';
import {WALL_FILE_UPLOADER} from '../../../modules/file-uploader/file-uploader.token';
import {IWallFileUploader, IWallFileUploaderResult} from '../../../modules/file-uploader/file-uploader.types';
import {IResizeData} from '../../../modules/resizable/resizable.directive';
import {Base64ToFile} from '../../../modules/utils/base64-to-file';
import {Guid} from '../../../modules/utils/guid';
import {ImgEncoder} from '../../../modules/utils/img-encoder.service';
import {ImgBrickState, ImgBrickStateMetadata} from '../img-brick-state.interface';
import {InputContextComponent} from '../input-context/input-context.component';
import {IOnWallFocus} from '../../../wall/components/wall/interfaces/wall-component/on-wall-focus.interface';

@Component({
    selector: 'img-brick',
    templateUrl: './img-brick.component.html',
    styleUrls: ['./img-brick.component.scss']
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

    isSrcBase64 = false;

    lastWidth: number;

    imageSrcPlaceholderRef: StickyModalRef;

    resizable = {
        resize: this.onResize.bind(this),
        resizeStart: this.onResizeStart.bind(this),
        resizeEnd: this.onResizeEnd.bind(this)
    };

    constructor(private renderer: Renderer2,
                private componentFactoryResolver: ComponentFactoryResolver,
                private ngxStickyModalService: StickyModalService,
                @Inject(WALL_FILE_UPLOADER) private wallFileUploader: IWallFileUploader,
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
            this.isSrcBase64 = this.isBase64(this.scope.src);

            if (!this.scope.width) {
                this.setUpImageWidth();
            }

            if (this.isSrcBase64) {
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

    applyImageSrc(imageSrc: string, metadata?: ImgBrickStateMetadata): Promise<any> {
        return this.isImage(imageSrc)
            .then(() => {
                this.scope.src = imageSrc;
                this.isSrcBase64 = false;

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
            return this.applyImageSrc(uploadInfo.downloadURL, {
                path: uploadInfo.path
            });
        }, () => {
        });
    }

    showPanel() {
        if (!this.imageSrcPlaceholderRef) {
            this.imageSrcPlaceholderRef = this.ngxStickyModalService.open({
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
    }

    isBase64(str: string) {
        str = str.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');

        try {
            return btoa(atob(str)) === str;
        } catch (err) {
            return false;
        }
    }

    private uploadImage(): Promise<IWallFileUploaderResult> {
        if (!this.wallFileUploader.canUploadFile()) {
            return Promise.reject();
        }

        const fileName = (new Guid()).get();
        const imgFile = (new Base64ToFile(this.scope.src, fileName)).getFile();

        return this.wallFileUploader.upload(this.id, imgFile);
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
