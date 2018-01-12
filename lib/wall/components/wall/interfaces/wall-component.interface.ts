import { Observable } from 'rxjs/Observable';

export interface IWallComponent {
    id: string;
    state: any;
    stateChanges: Observable<any>;
}
