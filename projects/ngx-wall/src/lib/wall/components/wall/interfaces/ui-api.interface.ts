import {Mode} from '../wall-view.model';

export interface IWallUiApi {
    mode: Mode;

    enableMediaInteraction(): void;

    disableMediaInteraction(): void;
}
