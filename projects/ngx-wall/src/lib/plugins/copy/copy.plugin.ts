import {DOCUMENT} from '@angular/common';
import {Injector} from '@angular/core';
import {IWallModel, IWallPlugin} from '../../wall/wall';

export class CopyPlugin implements IWallPlugin {
    name: 'copy';
    version: '0.0.0';

    doc: Document = null;

    onCopyBound: any;

    wallModel: IWallModel;

    constructor(private injector: Injector) {
        this.doc = this.injector.get(DOCUMENT);

        this.onCopyBound = this.onCopy.bind(this);

        this.doc.addEventListener('copy', this.onCopyBound);
    }

    onWallInitialize(model: IWallModel) {
        this.wallModel = model;
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
        const selectedBrickIds = this.wallModel.api.ui.getSelectedBrickIds();

        return selectedBrickIds
            .map((selectedBrickId) => this.wallModel.api.core.getBrickTextRepresentation(selectedBrickId))
            .map((textRepresentation) => textRepresentation.trim())
            .join('\n');
    }
}
