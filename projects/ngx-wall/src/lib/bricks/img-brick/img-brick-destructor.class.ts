import {Inject, Injectable} from '@angular/core';
import {IWallFileUploader, WALL_FILE_UPLOADER} from '../../modules/file-uploader/file-uploader';
import {IBrickSnapshot} from '../../wall/wall';
import {ImgBrickState} from './img-brick-state.interface';

@Injectable()
export class ImgModel {
    constructor(@Inject(WALL_FILE_UPLOADER) private wallFileUploader: IWallFileUploader) {
    }

    remove(brickSnapshot: IBrickSnapshot): Promise<any> {
        const state: ImgBrickState = brickSnapshot.state;

        if (state.src && state.metadata && state.metadata.path) {
            return this.wallFileUploader.remove(state.metadata.path);
        }

        return Promise.resolve();
    }
}
