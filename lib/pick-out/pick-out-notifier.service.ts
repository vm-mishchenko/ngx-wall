import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {PickOutHandlerService} from './pick-out-handler.service';

@Injectable()
export class PickOutNotifier {
    changes: Subject<any> = new Subject();

    constructor(private pickOutHandlerService: PickOutHandlerService) {
        this.pickOutHandlerService.changes.subscribe((e) => {
            this.changes.next(e);
        });
    }
}
