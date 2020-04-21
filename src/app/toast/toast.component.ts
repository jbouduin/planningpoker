import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { AnimationEvent } from '@angular/animations';

import { ToastData, TOAST_CONFIG_TOKEN, ToastConfig } from './toast-config';
import { ToastRef } from './toast-ref';
import { toastAnimations, ToastAnimationState } from './toast-animation';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['toast.component.scss'],
  animations: [toastAnimations.fadeToast]
})
export class ToastComponent implements OnInit, OnDestroy {

  // <editor-fold desc='Public properties'>
  public animationState: ToastAnimationState = 'default';
  public iconType: string;
  // </editor-fold>

  // <editor-fold desc='Private properties'>
  private intervalId = 0;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    public readonly data: ToastData,
    readonly ref: ToastRef,
    @Inject(TOAST_CONFIG_TOKEN) public toastConfig: ToastConfig
    ) {
      this.iconType = data.type === 'success' ? 'done' : data.type;
  }
  // </editor-fold>

  // <editor-fold desc='Public Angular interface methods'>
  public ngOnInit() {
    this.intervalId = setTimeout(() => this.animationState = 'closing', 5000);
  }

  public ngOnDestroy() {
    clearTimeout(this.intervalId);
  }
  // </editor-fold>

  // <editor-fold desc='Public methods'>
  public close() {
    this.ref.close();
  }

  public onFadeFinished(event: AnimationEvent) {
    const { toState } = event;
    const isFadeOut = (toState as ToastAnimationState) === 'closing';
    const itFinished = this.animationState === 'closing';

    if (isFadeOut && itFinished) {
      this.close();
    }
  }
  // </editor-fold>
}
