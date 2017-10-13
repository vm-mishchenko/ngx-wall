import { ReactiveReadOnlyProperty } from "../../../../reactive-property";

export interface WallState {
    mode: ReactiveReadOnlyProperty<string>
    isMediaInteractionEnabled: ReactiveReadOnlyProperty<boolean>
}