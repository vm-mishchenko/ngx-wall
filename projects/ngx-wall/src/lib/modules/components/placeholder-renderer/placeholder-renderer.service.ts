import {
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    EmbeddedViewRef,
    Injectable,
    Injector
} from '@angular/core';
import {PlaceholderComponent} from './component/placeholder.component';

@Injectable()
export class PlaceholderRenderer {
    private placeholderComponentRef: ComponentRef<PlaceholderComponent> = null;

    constructor(private componentFactoryResolver: ComponentFactoryResolver,
                private appRef: ApplicationRef,
                private injector: Injector) {
    }

    render(x: number, y: number, size: number, isHorizontal: boolean = true) {
        if (!this.placeholderComponentRef) {
            this.renderPlaceholderComponent();
        }

        this.setCoordinate(x, y, size, isHorizontal);
    }

    clear() {
        if (this.placeholderComponentRef) {
            this.removePlaceholderComponent();
        }
    }

    private renderPlaceholderComponent() {
        this.placeholderComponentRef = this.componentFactoryResolver
            .resolveComponentFactory(PlaceholderComponent)
            .create(this.injector);

        // 2. Attach component to the appRef so that it's inside the ng component tree
        this.appRef.attachView(this.placeholderComponentRef.hostView);

        // 3. Get DOM element from component
        const domElem = (this.placeholderComponentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

        // 4. Append DOM element to the body
        document.body.appendChild(domElem);
    }

    private removePlaceholderComponent() {
        this.appRef.detachView(this.placeholderComponentRef.hostView);
        this.placeholderComponentRef.destroy();

        this.placeholderComponentRef = null;
    }

    private setCoordinate(x: number, y: number, size: number, isHorizontal: boolean) {
        this.placeholderComponentRef.instance.setCoordinate(x, y, size, isHorizontal);
    }
}
