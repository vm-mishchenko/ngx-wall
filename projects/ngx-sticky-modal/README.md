# ngx-sticky-modal
[![npm version](https://badge.fury.io/js/ngx-sticky-modal.svg)](https://www.npmjs.com/package/ngx-sticky-modal)

## What
`ngx-sticky-modal` allows to show modals relative to a dom element or particular coordinate. Perfect suits for showing context menus, tooltips, etc.  

## Demo
https://vm-mishchenko.github.io/ngx-sticky-modal

## Features
`ngx-sticky-modal` is angular library based on angular-cli project. Under the hood it heavily uses the `@angular/cdk` package for calculating the modal coordinate.

## How to use
####Install package
```
npm install ngx-sticky-modal
```

#### Add `StickyModalModule` as dependency
```typescript
import {StickyModalModule} from 'ngx-sticky-modal';

@NgModule({
    imports: [
        StickyModalModule
    ]
})
export class AppModule {
}
```

#### Show modal
```js
import {StickyModalService, StickyPositionStrategy} from 'ngx-sticky-modal';
import {ModalComponent} from './modal.component';

@Component({
    selector: 'app-button',
    template: '<button #btn (click)="showModal()"></button>'
})

export class RelativeSelectionComponent implements OnInit {
    @ViewChild('btn') btn: ElementRef;

    constructor(private ngxStickyModalService: StickyModalService) {
    }

    showModal(event: MouseEvent) {
        // show modal relative to #btn coordinate 
        this.ngxStickyModalService.open({
            component: ModalComponent,
            positionStrategy: {
                name: StickyPositionStrategy.flexibleConnected,
                options: {
                    relativeTo: this.btn.nativeElement
                }
            }
        });
        
        // show modal relative to viewport coordinate
        this.ngxStickyModalService.open({
            component: ModalComponent,
            positionStrategy: {
                name: StickyPositionStrategy.coordinate,
                options: {
                    clientX: 50,
                    clientY: 50
                }
            }
        });
    }
}
```
#### Add style
`ngx-sticky-modal` does not provide own css style file. As soon as library depends on `@angular/cdk` you could easily add style from it:

```typescript
@import '~@angular/cdk/overlay';
@include cdk-overlay;
```
