// https://github.com/s-panferov/awesome-typescript-loader/issues/411
export const awesomeTypescriptLoaderBug = true;


// Register new brick
export interface IBrickSpecification {
    tag: string;
    component: any;
}

export interface IBrickRegistry {
    get(tag: string): IBrickSpecification;

    getAll(): IBrickSpecification[];

    register(configuration: IBrickSpecification): void;
}


// Serialized Wall Definition
export interface IWallDefinition {
    bricks: IBrickDefinition[];
    layout: ILayoutDefinition;
}

export interface IBrickDefinition {
    id: string;
    type: string;

    // user specific data
    data: {};

    meta: {
        comments?: any[]
    }
}

export interface ILayoutDefinition {
    bricks: (ILayoutBrickDefinition | ILayoutGroupBrickDefinition)[];
}

export interface ILayoutBrickDefinition {
    id: string;
    type: string;
}

export interface ILayoutGroupBrickDefinition {
    type: string;
    columns: any[];
}


// Wall component
export interface IWallConfiguration {
    mode: string;
    onRegisterApi: Function;
    plugins: any[]
}