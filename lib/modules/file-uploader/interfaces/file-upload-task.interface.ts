import { Observable } from 'rxjs/Observable';

export interface IFileUploadTask {
    downloadURL(): Observable<string | null>;

    percentageChanges(): Observable<number | undefined>;
}
