import {IWallColumn} from './wall-column.interface';

export interface IWallRow {
    id: string;
    columns: IWallColumn[];
}
