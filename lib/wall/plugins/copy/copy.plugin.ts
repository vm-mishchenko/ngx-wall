import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { WallApi } from '../../components/wall';
import { IPluginDestroy } from '../../wall.interfaces';

@Injectable()
export class CopyPlugin implements IPluginDestroy {
    doc: Document = null;

    onCopyBound: any;

    constructor(private wallApi: WallApi,
                @Inject(DOCUMENT) doc) {
        this.doc = doc;

        this.onCopyBound = this.onCopy.bind(this);

        this.doc.addEventListener('copy', this.onCopyBound);
    }

    onCopy(e: ClipboardEvent) {
        const selectedTextRepresentation = this.getSelectedTextRepresentation();

        if (selectedTextRepresentation.length) {
            e.preventDefault();

            this.addToClipboard(e, selectedTextRepresentation);
        }
    }

    onPluginDestroy() {
        this.doc.removeEventListener('click', this.onCopy);
    }

    private addToClipboard(e: ClipboardEvent, str: string) {
        e.clipboardData.setData('text/plain', str);
    }

    private getSelectedTextRepresentation(): string {
        const selectedBrickIds = this.wallApi.core.getSelectedBrickIds();

        return selectedBrickIds
            .map((selectedBrickId) => this.wallApi.core.getBrickTextRepresentation(selectedBrickId))
            .map((textRepresentation) => textRepresentation.trim())
            .join('\n');
    }
}
