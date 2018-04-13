import {Injectable} from '@angular/core';
import {IBrickSnapshot} from '../wall';
import {ImgBrickState} from './img-brick-state.interface';
import {FileUploaderService} from '../modules/file-uploader/file-uploader.service';

@Injectable()
export class ImgModel {
    constructor(private fileUploaderService: FileUploaderService) {
    }

    remove(brickSnapshot: IBrickSnapshot): Promise<any> {
        const state: ImgBrickState = brickSnapshot.state;

        if (state.src && state.metadata && state.metadata.reference) {
            return this.fileUploaderService.remove(state.metadata.reference).toPromise();
        } else {
            return Promise.resolve();
        }
    }
}
