import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { WallApi } from '../../components/wall';
import { IPluginDestroy } from '../../wall.interfaces';

@Injectable()
export class CopyPlugin implements IPluginDestroy {
    doc: any = null;

    onCopyBound: any;

    constructor(private wallApi: WallApi,
                @Inject(DOCUMENT) doc) {
        this.doc = doc;

        this.onCopyBound = this.onCopy.bind(this);

        this.doc.addEventListener('copy', this.onCopyBound);
    }

    onCopy(e: ClipboardEvent) {
        const selectedBrickIds = this.wallApi.core.getSelectedBrickIds();

        const brickData = selectedBrickIds
            .map((selectedBrickId) => this.wallApi.core.getBrickSnapshot(selectedBrickId));

        console.log(brickData);
    }

    onPluginDestroy() {
        this.doc.removeEventListener('click', this.onCopy);
    }
}
