import {OverlayRef} from '@angular/cdk/overlay';

export class StickyModalRef {
    result: Promise<any>;

    private resolve: (data?: any) => void;
    private reject: (data?: any) => void;

    constructor(private overlayRef: OverlayRef) {
        this.result = new Promise<any>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    dismiss(data?: any): void {
        this.reject(data);
        this.dispose();
    }

    close (data?: any): void {
        this.resolve(data);
        this.dispose();
    }

    private dispose() {
        this.overlayRef.dispose();
    }
}
