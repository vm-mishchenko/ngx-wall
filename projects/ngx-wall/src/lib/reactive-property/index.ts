/* tslint:disable */
import {Subject} from 'rxjs';

export class ReactiveReadOnlyProperty<T> {
    valueChanged: Subject<T>;
    private value: T;

    constructor(value, valueChanged) {
        this.value = value;

        this.valueChanged = valueChanged;

        this.valueChanged.subscribe((newValue) => this.value = newValue);
    }

    getValue(): T {
        return this.value;
    }
}

export class ReactiveProperty<T> {
    valueChanged: Subject<any> = new Subject();

    private value: any;

    constructor(value: T) {
        this.value = value;
    }

    setValue(value: T) {
        this.value = value;

        this.valueChanged.next(this.value);
    }

    getValue(): T {
        return this.value;
    }
}
