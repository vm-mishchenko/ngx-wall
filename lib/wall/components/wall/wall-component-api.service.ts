import { Subject } from 'rxjs/Subject';
import { WallModel } from './wall.model';

export class WallComponentApi {
    events: Subject<any> = new Subject();

    constructor(private wallModel: WallModel) {
    }

    getPlan() {
        return this.wallModel.getPlan();
    }
}