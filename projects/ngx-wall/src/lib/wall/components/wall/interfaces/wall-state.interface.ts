import { ReactiveReadOnlyProperty } from '../../../../reactive-property';

export interface IWallState {
    mode: ReactiveReadOnlyProperty<string>;
    isMediaInteractionEnabled: ReactiveReadOnlyProperty<boolean>;
}
