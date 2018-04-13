import {Injectable} from '@angular/core';
import {IFileUploader} from './interfaces/file-uploader.interface';
import {IFileUploadTask} from './interfaces/file-upload-task.interface';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Injectable()
export class FileUploaderService implements IFileUploader {
    private uploaderServices: Map<string, IFileUploader> = new Map();

    upload(fileReference: string, file: File): IFileUploadTask {
        // randomly choose uploader services for uploading
        const uploader = this.getUploaderService(fileReference);

        if (!uploader) {
            throw new Error(`Expect receive file reference ${fileReference}`);
        }

        return uploader.upload(this.extractFilePathFromReference(fileReference), file);
    }

    remove(fileReference: string): Observable<any> {
        const uploader = this.getUploaderService(fileReference);

        if (!uploader) {
            console.error(`Cannot resolve uploader for ${fileReference}`);

            return Observable.of(null);
        } else {
            return uploader.remove(this.extractFilePathFromReference(fileReference));
        }
    }

    // allow define which uploader was chosen, to be able delete file after
    getFileReference(filePath: string): string {
        return `${this.getRandomUploaderType()}/${filePath}`;
    }

    registerUploadService(type: string, service: IFileUploader) {
        this.uploaderServices.set(type, service);
    }

    canUploadFile(): boolean {
        return Boolean(this.uploaderServices.size);
    }

    private extractFilePathFromReference(fileReference: string): string {
        const filePathArray = fileReference.split('/');

        filePathArray.splice(0, 1);

        return filePathArray.join('/');
    }

    private getUploaderService(fileReference: string): IFileUploader {
        const filePathArray = fileReference.split('/');
        const uploaderType = filePathArray.splice(0, 1)[0];

        return this.uploaderServices.get(uploaderType);
    }

    private getRandomUploaderType(): string {
        const uploaderTypes = Array.from(this.uploaderServices.keys());

        return uploaderTypes[Math.floor(Math.random() * uploaderTypes.length)];
    }
}
