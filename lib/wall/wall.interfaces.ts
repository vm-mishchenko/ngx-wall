// https://github.com/s-panferov/awesome-typescript-loader/issues/411
import { IBrickSnapshot } from './model/wall.events';

export const awesomeTypescriptLoaderBug2 = true;

// Register new brick
export interface IBrickSpecification {
    tag: string;
    component: any;
    supportText?: boolean;
    textRepresentation?: ITextRepresentationConstructor;
}

export interface ITextRepresentationConstructor {
    new (brickSnapshot: IBrickSnapshot): ITextRepresentation;
}

export interface ITextRepresentation {
    getText(): string;
}

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
    };
}

export interface ILayoutDefinition {
    // todo rename to rows
    bricks: IRowLayoutDefinition[];
}

export interface IRowLayoutDefinition {
    columns: IColumnLayoutDefinition[];
    id?: string;
}

export interface IColumnLayoutDefinition {
    bricks: Array<{ id: string }>;
}

export interface IPluginDestroy {
    onPluginDestroy();
}
