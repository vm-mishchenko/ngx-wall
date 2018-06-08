import {IBrickDefinition} from './brick-definition.interface';
import {ILayoutDefinition} from './layout-definition.interface';

export interface IWallDefinition {
    bricks: IBrickDefinition[];
    layout: ILayoutDefinition;
}
