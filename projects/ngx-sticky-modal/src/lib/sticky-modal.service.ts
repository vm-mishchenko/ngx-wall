import {Overlay, OverlayConfig} from '@angular/cdk/overlay';
import {OverlayRef} from '@angular/cdk/overlay/typings/overlay-ref';
import {ComponentPortal, PortalInjector} from '@angular/cdk/portal';
import {Injectable, Injector} from '@angular/core';
import {CoordinatePositionStrategy} from './position-strategies/coordinate-position-strategy';
import {IStickyModalConfig, StickyPositionStrategy} from './sticky-modal-config.interface';
import {StickyModalRef} from './sticky-modal-ref';
import {DEFAULT_MODAL_CLOSE_ON_ESCAPE, DEFAULT_MODAL_OVERLAY_CONFIG, DEFAULT_POSITION} from './sticky-modal.config';
import {STICKY_MODAL_DATA} from './sticky-modal.tokens';

@Injectable()
export class StickyModalService {
    constructor(private overlay: Overlay, private injector: Injector) {
    }

    open(config: IStickyModalConfig): StickyModalRef {
        config = this.prepareConfig({...config});

        // Returns an OverlayRef (which is a PortalHost)
        const overlayRef = this.createOverlay(config);

        const modalRef = new StickyModalRef(overlayRef);

        const injector = this.createInjector(config, modalRef);

        // Create ComponentPortal that can be attached to a PortalHost
        const filePreviewPortal = new ComponentPortal(config.component, null, injector, config.componentFactoryResolver);

        // Attach ComponentPortal to PortalHost
        overlayRef.attach(filePreviewPortal);

        this.setUpEventHandlers(overlayRef, modalRef, config);

        // animate dialog
        requestAnimationFrame(() => {
            overlayRef.overlayElement.classList.add('cdk-overlay-pane__show');
        });

        return modalRef;
    }

    private prepareConfig(config: IStickyModalConfig) {
        // Override default configuration
        config.overlayConfig = {
            ...DEFAULT_MODAL_OVERLAY_CONFIG,
            ...config.overlayConfig
        };

        config.position = {
            ...DEFAULT_POSITION,
            ...config.position
        };

        config.data = config.data || {};

        if (config.closeOnEscape === undefined) {
            config.closeOnEscape = DEFAULT_MODAL_CLOSE_ON_ESCAPE;
        }

        return config;
    }

    private setUpEventHandlers(overlayRef: OverlayRef,
                               modalRef: StickyModalRef,
                               config: IStickyModalConfig) {
        overlayRef.backdropClick().subscribe(_ => modalRef.dismiss());

        function onKeyDownHandler(event: KeyboardEvent) {
            if (event.keyCode === 27) {
                modalRef.dismiss();
            }
        }

        function onClickHandler(event: MouseEvent) {
            let currentElement: HTMLElement = event.target as HTMLElement;
            let clickOnOverlay = false;

            while (currentElement && !clickOnOverlay) {
                if (currentElement === overlayRef.overlayElement) {
                    clickOnOverlay = true;
                } else {
                    currentElement = currentElement.parentElement;
                }
            }

            if (!clickOnOverlay) {
                modalRef.dismiss();
            }
        }

        if (config.closeOnEscape) {
            setTimeout(() => {
                document.addEventListener('keydown', onKeyDownHandler);
            }, 0);
        }

        if (!config.overlayConfig.hasBackdrop) {
            setTimeout(() => {
                document.addEventListener('click', onClickHandler);
            }, 0);
        }

        modalRef.result.then(() => {
            document.removeEventListener('click', onClickHandler);
            document.removeEventListener('keydown', onKeyDownHandler);
        }, () => {
            document.removeEventListener('click', onClickHandler);
            document.removeEventListener('keydown', onKeyDownHandler);
        });
    }

    private createOverlay(config: IStickyModalConfig): OverlayRef {
        // Returns an OverlayConfig
        const overlayConfig = this.getOverlayConfig(config);

        // Returns an OverlayRef
        return this.overlay.create(overlayConfig);
    }

    private getOverlayConfig(config: IStickyModalConfig): OverlayConfig {
        let positionStrategy;

        if (config.positionStrategy.name === StickyPositionStrategy.flexibleConnected) {
            positionStrategy = this.overlay
                .position()
                .flexibleConnectedTo(config.positionStrategy.options.relativeTo)
                .withPositions([
                    {...config.position}
                ]);
        } else if (config.positionStrategy.name === StickyPositionStrategy.coordinate) {
            positionStrategy = new CoordinatePositionStrategy(config.positionStrategy.options);
        } else {
            throw new Error(`Position Strategy Name is not supported`);
        }

        const overlayConfig = new OverlayConfig({
            hasBackdrop: config.overlayConfig.hasBackdrop,
            backdropClass: config.overlayConfig.backdropClass,
            panelClass: config.overlayConfig.panelClass,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy
        });

        return overlayConfig;
    }

    private createInjector(
        config: IStickyModalConfig,
        modalRef: StickyModalRef
    ): PortalInjector {
        // Instantiate new WeakMap for our custom injection tokens
        const injectionTokens = new WeakMap();

        // Set custom injection tokens
        injectionTokens.set(StickyModalRef, modalRef);
        injectionTokens.set(STICKY_MODAL_DATA, config.data);

        // Instantiate new PortalInjector
        return new PortalInjector(this.injector, injectionTokens);
    }
}
