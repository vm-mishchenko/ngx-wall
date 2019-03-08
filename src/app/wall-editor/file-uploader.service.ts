import {Injectable} from '@angular/core';
import {IWallFileUploader, IWallFileUploaderResult} from 'ngx-wall';

@Injectable()
export class FileUploaderService implements IWallFileUploader {
    constructor() {
    }

    upload(brickId: string, file): Promise<IWallFileUploaderResult> {
        return Promise.resolve({
            path: '',
            downloadURL: ''
        });
    }

    remove(path: string): Promise<any> {
        return Promise.resolve();
    }

    canUploadFile(): boolean {
        return false;
    }
}
