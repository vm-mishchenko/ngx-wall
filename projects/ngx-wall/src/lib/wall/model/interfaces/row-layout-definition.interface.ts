import {IColumnLayoutDefinition} from './column-layout-definition.interface';

export interface IRowLayoutDefinition {
    columns: IColumnLayoutDefinition[];
    id?: string;
}
