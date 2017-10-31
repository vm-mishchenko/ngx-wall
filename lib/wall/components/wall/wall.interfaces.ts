// https://github.com/s-panferov/awesome-typescript-loader/issues/411
export const awesomeTypescriptLoaderBug = true;

export interface BrickDefinition {
    id: string;
    tag: string;

    // user specific data
    data: {};
 
    meta: {
        comments?: any[]
    }
}

export interface LayoutDefinition {
    bricks: RowLayoutDefinition[];
}

export interface RowLayoutDefinition {
    columns: ColumnLayoutDefinition[];
}

export interface ColumnLayoutDefinition {
    bricks: { id: string }[]
}

// Wall component
export interface WallConfiguration {
    mode?: string;
    onRegisterApi?: Function;
}

// Custom wall component interface
export interface onWallFocus {
    onWallFocus(): void;
}