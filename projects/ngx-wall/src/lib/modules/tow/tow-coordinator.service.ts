import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {StartWorkingEvent} from './events/start-working.event';
import {StopWorkingEvent} from './events/stop-working.event';
import {WorkInProgressEvent} from './events/work-in-progress.event';

@Injectable()
export class TowCoordinator {
    events: Subject<any> = new Subject();

    // start track when slave start working
    private isSlaveWorking = false;

    constructor() {
        document.addEventListener('dragover', (event: DragEvent) => {
            if (this.isSlaveWorking) {
                event.preventDefault();

                event.dataTransfer.dropEffect = 'move';

                this.slaveWorkProgress(event.clientX, event.clientY);
            }
        });
    }

    slaveStartWorking(id: string) {
        this.isSlaveWorking = true;

        this.events.next(new StartWorkingEvent(id));
    }

    slaveWorkProgress(clientX: number, clientY: number) {
        this.events.next(new WorkInProgressEvent({
            clientX,
            clientY
        }));
    }

    slaveStopWorking(id) {
        this.isSlaveWorking = false;

        this.events.next(new StopWorkingEvent(id));
    }
}
