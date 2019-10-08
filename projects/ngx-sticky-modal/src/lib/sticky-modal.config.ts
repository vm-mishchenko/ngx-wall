import {OverlayConfig} from '@angular/cdk/overlay';
import {ConnectedPosition} from '@angular/cdk/overlay/typings/position/flexible-connected-position-strategy';

export const DEFAULT_MODAL_CLOSE_ON_ESCAPE = true;

export const DEFAULT_MODAL_OVERLAY_CONFIG: OverlayConfig = {
    hasBackdrop: true,
    backdropClass: '',
    panelClass: ''
};

export const DEFAULT_POSITION: ConnectedPosition = {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'center'
};
