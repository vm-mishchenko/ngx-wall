import {ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output} from '@angular/core';
import {IListItem} from './item-list.interface';

@Component({
    selector: 'w-item-list',
    templateUrl: './item-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemListComponent {
    @Input() items: IListItem[];
    @Output() selected: EventEmitter<IListItem> = new EventEmitter();

    @HostBinding('class.w-item-list') showMenu = true;

    onItemSelected(item: IListItem) {
        this.selected.emit(item);
    }

    trackByFn(index, item) {
        return item.value;
    }
}
