import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { BrickRegistry, IBrickDefinition, IBrickSpecification } from '../../wall';
import { TEXT_BRICK_TAG } from '../text-brick.constant';

@Component({
    selector: 'w-bricks-list',
    templateUrl: './bricks-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BricksListComponent implements OnInit, OnDestroy {
    @Input() config: {
        text$: Observable<string>,
        up$: Observable<any>,
        down$: Observable<any>,
        enter$: Observable<any>
        selectedTag$: Subject<string>
    };

    selectedTag$: BehaviorSubject<string> = new BehaviorSubject(null);

    bricksList$: BehaviorSubject<IBrickSpecification[]> = new BehaviorSubject([]);

    private subscriptions: Subscription[] = [];

    constructor(private brickRegistry: BrickRegistry) {
        this.updateBricksList('');
    }

    ngOnInit() {
        this.subscriptions.push(
            this.config.text$.subscribe((filterText) => {
                this.updateBricksList(filterText.slice(1));
            })
        );

        this.subscriptions.push(
            this.config.up$.subscribe(() => {
                this.onNavigationUpDownHandler(true);
            })
        );

        this.subscriptions.push(
            this.config.down$.subscribe(() => {
                this.onNavigationUpDownHandler(false);
            })
        );

        this.subscriptions.push(
            this.config.enter$.subscribe(() => {
                this.notifySelectedTag();
            })
        );
    }

    onBrickSelected(brickDescription: IBrickDefinition) {
        this.selectedTag$.next(brickDescription.tag);

        this.notifySelectedTag();
    }

    trackByFn(index, item) {
        return item.tag;
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    private notifySelectedTag() {
        this.config.selectedTag$.next(this.selectedTag$.getValue());
    }

    private updateBricksList(filterText: string) {
        const brickDescriptors = this.brickRegistry.getAll()
            .filter((brickDescriptor) => {
                if (brickDescriptor.tag === TEXT_BRICK_TAG) {
                    return false;
                } else {
                    return brickDescriptor.tag.includes(filterText);
                }
            }).sort((a, b) => {
                if (a.tag.startsWith(filterText)) {
                    return -1;
                } else if (b.tag.startsWith(filterText)) {
                    return 1;
                } else {
                    return 0;
                }
            });

        if (brickDescriptors.length) {
            this.selectedTag$.next(brickDescriptors[0].tag);
        } else {
            this.selectedTag$.next(null);
        }

        this.bricksList$.next(brickDescriptors);
    }

    private onNavigationUpDownHandler(isUp: boolean): void {
        const currentSelectedTag = this.selectedTag$.getValue();
        const currentBrickList = this.bricksList$.getValue();

        if (currentSelectedTag && currentBrickList.length > 1) {
            const currentSelectedBrickIndex = currentBrickList.findIndex((brickDescriptor) => {
                return brickDescriptor.tag === currentSelectedTag;
            });

            let nextSelectedBrick;

            if (isUp) {
                nextSelectedBrick = currentBrickList[currentSelectedBrickIndex - 1];

                if (!nextSelectedBrick) {
                    // take last brick
                    nextSelectedBrick = currentBrickList[currentBrickList.length - 1];
                }
            } else {
                // is bottom
                nextSelectedBrick = currentBrickList[currentSelectedBrickIndex + 1];

                if (!nextSelectedBrick) {
                    // take first brick
                    nextSelectedBrick = currentBrickList[0];
                }
            }

            this.selectedTag$.next(nextSelectedBrick.tag);

            // wait until component re-renders
            setTimeout(() => {
                document.getElementsByClassName('w-bricks-list__selected')[0].scrollIntoView();
            });
        }
    }
}
