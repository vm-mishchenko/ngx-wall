// https://github.com/s-panferov/awesome-typescript-loader/issues/411
import { Subscription } from 'rxjs/Subscription';

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
    tag: string;

    // user specific data
    data: {};

    meta: {
        comments?: any[]
    }
}

export interface ILayoutDefinition {
    bricks: IRowLayoutDefinition[];
}

export interface IRowLayoutDefinition {
    columns: IColumnLayoutDefinition[];
}

export interface IColumnLayoutDefinition {
    bricks: { id: string }[]
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

export interface IWallApi {
    core: IWallCoreApi;

    features: any;

    registerFeatureApi(featureName: string, api: any): void;
}

export interface IWallCoreApi {
    subscribe(callback: Function): Subscription;

    removeBrick(brickId: string);

    getPlan(): IWallDefinition;

    getBrickStore(): IBrickStore;

    addDefaultBrick(): void;
}

export interface IWallStore {
    initialize(bricks: IBrickDefinition[]): void;

    subscribe(callback: Function): Subscription;

    serialize(): IBrickDefinition[];

    addBrick();

    removeBrick(brickId: string);

    getBrickStore(brickId: string): IBrickStore;
}

export interface IBrickStore {
    subscribe(callback: Function): Subscription;

    set(data: any): void;

    get(data: any): void;
}
