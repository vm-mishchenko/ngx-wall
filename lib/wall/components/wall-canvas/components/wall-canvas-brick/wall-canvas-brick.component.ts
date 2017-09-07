import {
    Component,
    ComponentFactoryResolver,
    Injector,
    Input,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { WallCanvasApi } from '../../wall-canvas.api';

@Component({
    selector: 'wall-canvas-brick',
    templateUrl: './wall-canvas-brick.component.html'
})

export class WallCanvasBrickComponent implements OnInit {
    @Input() brick: any;

    private selected: boolean = false;

    @ViewChild('brickContainer', {read: ViewContainerRef}) container: ViewContainerRef;

    constructor(private injector: Injector,
                private resolver: ComponentFactoryResolver,
                private wallCanvasApi: WallCanvasApi) {
    }

    ngOnInit() {
        const factory = this.resolver.resolveComponentFactory(this.brick.component);

        const componentReference = this.container.createComponent(factory, null, this.injector);

        componentReference.instance['id'] = this.brick.id;

        this.wallCanvasApi.core.registerCanvasBrickInstance(this.brick.id, this, componentReference.instance);
    }

    onFocused() {
        this.wallCanvasApi.core.onFocused(this.brick.id);
    }

    select() {
        this.selected = true;
    }

    unselect() {
        this.selected = false;
    }
}