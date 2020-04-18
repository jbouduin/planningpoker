import { OverlayRef } from '@angular/cdk/overlay';

export class ToastRef {

  // constructor
  public constructor(private readonly overlay: OverlayRef) { }

  // public methods
  public close() {
    this.overlay.dispose();
  }

  public isVisible() {
    return this.overlay && this.overlay.overlayElement;
  }

  public getPosition() {
    return this.overlay.overlayElement.getBoundingClientRect()
  }
}
