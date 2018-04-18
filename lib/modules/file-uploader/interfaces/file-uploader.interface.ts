import { Observable } from 'rxjs/Observable';
import { IFileUploadTask } from './file-upload-task.interface';

export interface IFileUploader {
    upload(filePath: string, file: File): IFileUploadTask;

    remove(filePath: string): Observable<void>;
}
