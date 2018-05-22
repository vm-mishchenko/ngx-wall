// https://github.com/s-panferov/awesome-typescript-loader/issues/411
import { WallApi } from './wall-api.service';

export const awesomeTypescriptLoaderBug = true;

// Wall component
export interface IWallConfiguration {
    mode?: string;
    onRegisterApi?: (api: WallApi) => void;
}

// Custom wall component interface
export interface IOnWallFocus {
    onWallFocus(focusContext?: IFocusContext): void;
}

export interface IOnWallStateChange {
    onWallStateChange(state: any): void;
}

export interface IFocusContext {
    initiator: string;
    details?: any;
}
