import {Observable} from 'rxjs';
import {IWallModel} from '../../../..';

export interface IWallComponent {
    id: string;
    state: any;
    wallModel?: IWallModel;
    stateChanges?: Observable<any>;
}
