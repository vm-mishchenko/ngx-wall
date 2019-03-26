import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'w-brick-input-placeholder',
    templateUrl: './brick-input-placeholder.component.html',
    styleUrls: ['./brick-input-placeholder.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrickInputPlaceholderComponent implements OnInit {
    @Input() text: string;
    @Input() icon: string;
    @Input() loading: boolean;
    @Output() selected: EventEmitter<MouseEvent> = new EventEmitter();

    constructor() {
    }

    onClick(event: MouseEvent) {
        this.selected.emit(event);
    }

    ngOnInit() {
    }
}
