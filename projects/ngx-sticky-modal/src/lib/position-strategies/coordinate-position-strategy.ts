import {PositionStrategy} from '@angular/cdk/overlay';
import {OverlayReference} from '@angular/cdk/overlay/typings/overlay-reference';
import {StickyCoordinatePositionStrategy} from '../sticky-modal-config.interface';

export class CoordinatePositionStrategy implements PositionStrategy {
    constructor(private options: StickyCoordinatePositionStrategy['options']) {
    }

    /** Attaches this position strategy to an overlay. */
    attach(overlayRef: OverlayReference) {
        /*
        * overlayRef.hostElement - define element position
        * overlayRef.overlayElement - user specific element
        * */

        const hostStyles = overlayRef.hostElement.style;


        hostStyles.position = 'absolute';
        hostStyles.left = `${this.options.clientX}px`;
        hostStyles.top = `${this.options.clientY}px`;

        hostStyles.width = `100%`;
        hostStyles.height = `100%`;
    }

    /** Updates the position of the overlay element. */
    apply(): void {
    }

    /** Called when the overlay is detached. */
    detach(): void {
    }

    /** Cleans up any DOM modifications made by the position strategy, if necessary. */
    dispose(): void {
    }
}
