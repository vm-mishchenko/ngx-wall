import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'w-loading-wrapper',
    template: `
        <div *ngIf="message" class="w-loading-wrapper__message">{{message}}</div>
        <div class="w-loading-wrapper__wrapper"></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingWrapperComponent implements OnInit {
    @Input() message: string;

    ngOnInit() {
    }
}
