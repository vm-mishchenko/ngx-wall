// Register new brick

export interface IBrickConfiguration {
    tag: string;
    component: any;
}

export interface IBrickRegistry {
    get(tag: string): IBrickConfiguration;

    getAll(): IBrickConfiguration[];

    register(configuration: IBrickConfiguration): void;
}


// Wall component
export interface IWallPlan {
    id: string;
    bricks: any[];
}

export interface IWallConfiguration {
    mode: string;
}