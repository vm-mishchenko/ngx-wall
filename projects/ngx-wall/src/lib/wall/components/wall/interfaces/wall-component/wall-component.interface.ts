import {Observable} from 'rxjs';
import {IWallModel} from '../../../../model/interfaces/wall-model.interface';

export interface IWallComponent {
    id: string;
    state: any;
    wallModel?: IWallModel;
    stateChanges?: Observable<any>;
}
