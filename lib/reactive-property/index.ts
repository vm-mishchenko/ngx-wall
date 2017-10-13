import { Subject } from "rxjs/Subject";

export class ReactiveReadOnlyProperty<T> {
    private value: T;

    valueChanged: Subject<T>;

    getValue(): T {
        return this.value;
    }

    constructor(value, valueChanged) {
        this.value = value;

        this.valueChanged = valueChanged;

        this.valueChanged.subscribe((value) => {
            this.value = value;
        });
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