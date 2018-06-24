import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {STICKY_MODAL_DATA} from 'ngx-sticky-modal';
import {ITextBrickApi} from '../text-brick-api.interface';

export interface ITextContextMenuComponent {
    api: ITextBrickApi;
}

@Component({
    selector: 'w-text-context-menu',
    templateUrl: './text-context-menu.component.html'
})
export class TextContextMenuComponent implements OnInit {
    @ViewChild('linkEl') linkEl: ElementRef;

    ui = {
        showLinkForm: false
    };

    constructor(@Inject(STICKY_MODAL_DATA) public config: ITextContextMenuComponent) {

    }

    ngOnInit() {
        this.config.api.saveSelection();
    }

    bold() {
        this.config.api.bold();
    }

    italic() {
        this.config.api.italic();
    }

    link() {
        this.switchLinkFormVisibility();

        if (this.ui.showLinkForm) {
            this.config.api.saveSelection();

            setTimeout(() => {
                if (this.config.api.isLinkSelected()) {
                    this.linkEl.nativeElement.value = this.config.api.getSelectedLinkHref();
                }

                this.linkEl.nativeElement.focus();
            });
        } else {
            this.config.api.restoreSelection();
        }
    }

    applyLink() {
        this.config.api.restoreSelection();

        if (this.config.api.isLinkSelected()) {
            this.config.api.changeLinkUrl(this.linkEl.nativeElement.value);
        } else {
            this.config.api.createLink(this.linkEl.nativeElement.value);
        }

        this.switchLinkFormVisibility();
    }

    unlink() {
        this.config.api.restoreSelection();

        this.config.api.unlink();

        this.switchLinkFormVisibility();
    }

    switchLinkFormVisibility() {
        this.ui.showLinkForm = !this.ui.showLinkForm;
    }
}
