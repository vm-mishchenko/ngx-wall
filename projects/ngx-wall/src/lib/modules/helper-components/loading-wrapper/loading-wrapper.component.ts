import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'w-loading-wrapper',
    templateUrl: './loading-wrapper.component.html',
    styleUrls: ['./loading-wrapper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingWrapperComponent implements OnInit {
    @Input() message: string;

    ngOnInit() {
    }
}
