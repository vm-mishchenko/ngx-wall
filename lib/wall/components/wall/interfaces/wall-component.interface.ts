import {Observable} from 'rxjs';

export interface IWallComponent {
    id: string;
    state: any;
    stateChanges: Observable<any>;
}
