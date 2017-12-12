import { Subject } from 'rxjs/Subject';
import { PickOutModelDestroyEvent } from './pick-out-model-destroy.event';

export class PickOutAreaModel {
    changes: Subject<any> = new Subject();

    initialX: number;
    initialY: number;

    x: number;
    y: number;
    width: number;
    height: number;

    setInitialPosition(x: number, y: number) {
        this.initialX = x;
        this.initialY = y;

        this.x = x;
        this.y = y;
    }

    setCurrentPosition(x: number, y: number) {
        // update x position and width
        if (x < this.initialX) {
            this.width = this.initialX - x;

            this.x = x;
        } else {
            this.width = Math.abs(x - this.x);
        }

        // update y position and height
        if (y < this.initialY) {
            this.height = this.initialY - y;

            this.y = y;
        } else {
            this.height = Math.abs(y - this.y);
        }
    }

    onDestroy() {
        this.changes.next(new PickOutModelDestroyEvent());
    }
}