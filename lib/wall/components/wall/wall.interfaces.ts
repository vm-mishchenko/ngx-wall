// https://github.com/s-panferov/awesome-typescript-loader/issues/411
export const awesomeTypescriptLoaderBug = true;

// Wall component
export interface IWallConfiguration {
    mode?: string;
    onRegisterApi?: (api: object) => void;
}

// Custom wall component interface
export interface IOnWallFocus {
    onWallFocus(focusContext?: IFocusContext): void;
}

export interface IFocusContext {
    initiator: string;
    details?: any;
}
