import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageBoxParams } from './message-box.params';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-message-box',
  imports: [CommonModule, MatButtonModule, MatDialogModule, TranslatePipe],
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent {
  //#region private properties ------------------------------------------------
  private readonly dialogRef: MatDialogRef<MessageBoxComponent>;
  private readonly params: MessageBoxParams;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get cancelButtonLabel(): string {
    return this.params.cancelButtonLabelKey;
  }

  public get showCancelButton(): boolean {
    return this.params.showCancelButton;
  }

  public get okButtonLabel(): string {
    return this.params.okButtonLabelKey;
  }

  public get text(): string {
    return this.params.textKey;
  }

  public get title(): string {
    return this.params.titleKey;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(dialogRef: MatDialogRef<MessageBoxComponent>, @Inject(MAT_DIALOG_DATA) params: MessageBoxParams) {
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
