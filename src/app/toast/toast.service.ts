import { Injectable, Injector, Inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { TranslateService } from '@ngx-translate/core';

import { ToastComponent } from './toast.component';
import { ToastData, TOAST_CONFIG_TOKEN, ToastConfig } from './toast-config';
import { ToastRef } from './toast-ref';

import { ErrorCode } from '@shared-lib';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  // <editor-fold desc='Private properties'>
  private lastToast?: ToastRef;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    private overlay: Overlay,
    private parentInjector: Injector,
    private translateService: TranslateService,
    @Inject(TOAST_CONFIG_TOKEN) private toastConfig: ToastConfig) { }
  // </editor-fold>

  // <editor-fold desc='Public methods'>
  public show(data: ToastData): ToastRef {
    const positionStrategy = this.getPositionStrategy();
    const overlayRef = this.overlay.create({ positionStrategy });

    const toastRef = new ToastRef(overlayRef);
    this.lastToast = toastRef;

    const injector = this.getInjector(data, toastRef, this.parentInjector);
    const toastPortal = new ComponentPortal(ToastComponent, null, injector);

    overlayRef.attach(toastPortal);

    return toastRef;
  }

  // TODO (#703) find out import Globalpositionstrategy
  public getPositionStrategy(): any {
    return this.overlay.position()
      .global()
      .top(this.getPosition())
      .right(this.toastConfig.position.right + 'px');
  }

  public getPosition(): string {
    const lastToastIsVisible = this.lastToast && this.lastToast.isVisible();
    const position = lastToastIsVisible && this.lastToast
      ? this.lastToast.getPosition().bottom
      : this.toastConfig.position.top;

    return position + 'px';
  }

  public getInjector(data: ToastData, toastRef: ToastRef, parentInjector: Injector): PortalInjector {
    const tokens = new WeakMap();

    tokens.set(ToastData, data);
    tokens.set(ToastRef, toastRef);

    return new PortalInjector(parentInjector, tokens);
  }
  // </editor-fold>

}
