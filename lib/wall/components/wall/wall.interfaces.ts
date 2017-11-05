// https://github.com/s-panferov/awesome-typescript-loader/issues/411
export const awesomeTypescriptLoaderBug = true;

// Wall component
export interface WallConfiguration {
    mode?: string;
    onRegisterApi?: Function;
}

// Custom wall component interface
export interface onWallFocus {
    onWallFocus(): void;
}