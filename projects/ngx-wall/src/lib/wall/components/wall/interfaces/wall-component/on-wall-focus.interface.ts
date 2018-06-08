import {IFocusContext} from './wall-component-focus-context.interface';

export interface IOnWallFocus {
    onWallFocus(focusContext?: IFocusContext): void;
}
