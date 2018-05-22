import {DOCUMENT} from '@angular/common';
import {Injector} from '@angular/core';
import {WallApi} from '../../components/wall';
import {IWallPlugin} from '../../wall.interfaces';

export class CopyPlugin implements IWallPlugin {
    doc: Document = null;

    onCopyBound: any;

    constructor(private wallApi: WallApi,
                private injector: Injector) {
        this.doc = this.injector.get(DOCUMENT);

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

    onWallPluginDestroy() {
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
