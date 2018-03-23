import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { StartWorkingEvent } from './events/start-working.event';
import { StopWorkingEvent } from './events/stop-working.event';
import { WorkInProgressEvent } from './events/work-in-progress.event';

@Injectable()
export class TowCoordinator {
    events: Subject<any> = new Subject();

    private currentYScrollPosition = 0;

    // start track when slave start working
    private isSlaveWorking = false;

    private doc;

    constructor(@Inject(DOCUMENT) doc) {
        this.doc = doc;

        this.doc.addEventListener('dragover', (event: DragEvent) => {
            if (this.isSlaveWorking) {
                event.preventDefault();

                event.dataTransfer.dropEffect = 'move';

                this.slaveWorkProgress(event.x, event.y);
            }
        });

        window.addEventListener('scroll', () => {
            this.currentYScrollPosition = window.pageYOffset;
        });
    }

    slaveStartWorking(id: string) {
        this.isSlaveWorking = true;

        this.events.next(new StartWorkingEvent(id));
    }

    slaveWorkProgress(xViewportPosition: number, yViewportPosition: number) {
        // respect window scroll position
        const yPosition = yViewportPosition + this.currentYScrollPosition;

        this.events.next(new WorkInProgressEvent({
            xViewportPosition,
            yViewportPosition,
            xPosition: xViewportPosition,
            yPosition
        }));
    }

    slaveStopWorking(id) {
        this.isSlaveWorking = false;
        this.events.next(new StopWorkingEvent(id));
    }
}
