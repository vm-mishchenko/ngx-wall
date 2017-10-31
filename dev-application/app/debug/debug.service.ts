import { ApplicationRef, Injectable } from '@angular/core';
import { enableDebugTools } from "@angular/platform-browser";

@Injectable()
export class DebugService {
    constructor(private applicationRef: ApplicationRef) {
    }

    mockChangeDetectionTick(beforeTick?: Function, afterTick?: Function) {
        const originalTick = this.applicationRef.tick;

        afterTick = afterTick || this.noop;
        beforeTick = beforeTick || this.noop;

        this.applicationRef.tick = () => {
            beforeTick();

            originalTick.apply(this.applicationRef);

            afterTick();
        };
    }

    enableDebugTools() {
        setTimeout(() => {
            enableDebugTools(this.applicationRef.components[0]);
        });
    }

    noop() {
    }
}