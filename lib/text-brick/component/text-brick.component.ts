import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {WallApi} from '../../index';

@Component({
    selector: 'text-brick',
    templateUrl: './text-brick-component.component.html',
    styleUrls: ['./text-brick-component.component.scss']
})
export class TextBrickComponent implements OnInit {
    @Input() id: string;

    @ViewChild('editor') editor: ElementRef;

    state: any = {};

    store: any = null;

    constructor(private wallApi: WallApi) {
    }

    ngOnInit() {
        this.store = this.wallApi.core.getBrickStore(this.id);

        this.state = this.store.get();

        this.state.text = this.state.text || '';

        this.editor.nativeElement.innerText = this.state.text;
    }

    onTextChanged() {
        this.state.text = this.editor.nativeElement.innerText;

        this.save();
    }

    onKeyPress(e: any) {
        const ENTER_KEY = 13;
        const DELETE_KEY = 46;
        const BACK_SPACE_KEY = 8;

        if (e.keyCode === ENTER_KEY) {
            e.preventDefault();

            this.wallApi.core.addBrickAfterInSameColumn(this.id, 'text');
        }

        if ((e.keyCode === BACK_SPACE_KEY || e.keyCode === DELETE_KEY) && this.state.text === '') {
            e.preventDefault();

            this.wallApi.core.removeBrick(this.id);
        }
    }

    onWallFocus() {
        this.editor.nativeElement.focus();

        // place caret at the end
        // https://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
        if (typeof window.getSelection != 'undefined' && typeof document.createRange != 'undefined') {
            const range = document.createRange();

            range.selectNodeContents(this.editor.nativeElement);
            range.collapse(false);

            const sel = window.getSelection();

            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    save() {
        this.store.set(this.state);
    }
}