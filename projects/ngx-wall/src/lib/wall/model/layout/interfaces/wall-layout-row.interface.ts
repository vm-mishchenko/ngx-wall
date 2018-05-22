import {IWallLayoutColumn} from './wall-layout-column.interface';

export interface IWallLayoutRow {
    id: string;
    columns: IWallLayoutColumn[];
}
