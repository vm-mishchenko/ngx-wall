import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {IFileUploadTask} from './interfaces/file-upload-task.interface';
import {IFileUploader} from './interfaces/file-uploader.interface';

@Injectable()
export class FileUploaderService implements IFileUploader {
    private uploaderServices: Map<string, IFileUploader> = new Map();

    private isEnabled = true;

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
            /* tslint:disable:no-console */
            console.error(`Cannot resolve uploader for ${fileReference}`);

            return of(null);
        } else {
            return uploader.remove(this.extractFilePathFromReference(fileReference));
        }
    }

    // allow define which uploader was chosen, to be able delete file after
    getFileReference(filePath: string): string {
        const uploaderType = this.getRandomUploaderType();
        const uploader = this.uploaderServices.get(uploaderType);

        // allow uploader add specific information in filePath
        if (uploader.getFileReference) {
            filePath = uploader.getFileReference(filePath);
        }

        return `${uploaderType}/${filePath}`;
    }

    registerUploadService(type: string, service: IFileUploader) {
        this.uploaderServices.set(type, service);
    }

    canUploadFile(): boolean {
        return this.isEnabled && Boolean(this.uploaderServices.size);
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
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
