import {Observable} from 'rxjs';
import {IFileUploadTaskSnapshot} from './file-upload-task-snapshot.interface';

export interface IFileUploadTask {
    percentageChanges(): Observable<number | undefined>;

    snapshotChanges(): Observable<IFileUploadTaskSnapshot>;
}
