import { IFileUploadTask } from './file-upload-task.interface';
import {Observable} from 'rxjs/Observable';

export interface IFileUploader {
    upload(filePath: string, file: File): IFileUploadTask;
    remove(filePath: string): Observable<void>;
}
