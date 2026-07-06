import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageDialogComponentParams } from './message-dialog.component.params';

@Component({
  selector: 'app-message-box',
  imports: [CommonModule, MatButtonModule, MatDialogModule, TranslatePipe],
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent {
  //#region private properties ------------------------------------------------
  private readonly dialogRef: MatDialogRef<MessageDialogComponent>;
  private readonly params: MessageDialogComponentParams;
  //#endregion

  //#region getters -----------------------------------------------------------
  protected get cancelButtonLabel(): string {
    return this.params.cancelButtonLabelKey;
  }

  protected get cancelButtonParams(): Record<string, unknown> | null {
    return this.params.cancelButtonParams;
  }

  protected get showCancelButton(): boolean {
    return this.params.showCancelButton;
  }

  protected get okButtonLabel(): string {
    return this.params.okButtonLabelKey;
  }

  protected get okButtonParams(): Record<string, unknown> | null {
    return this.params.okButtonParams;
  }

  protected get text(): string {
    return this.params.textKey;
  }

  protected get textParams(): Record<string, unknown> | null {
    return this.params.textParams;
  }

  protected get title(): string {
    return this.params.titleKey;
  }

  protected get titleParams(): Record<string, unknown> | null {
    return this.params.titleParams;
  }

  protected get textTitleParams(): Record<string, unknown> | null {
    return this.params.textParams;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(
    dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) params: MessageDialogComponentParams
  ) {
    this.dialogRef = dialogRef;
    this.params = params;
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public cancel(): void {
    this.dialogRef.close();
  }
  //#endregion
}
