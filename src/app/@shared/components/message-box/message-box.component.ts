import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { MessageBoxParams } from './message-box.params';

@Component({
  selector: 'shared-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit {

  //#region private properties ------------------------------------------------
  private readonly translateService: TranslateService;
  private readonly dialogRef: MatDialogRef<MessageBoxComponent>;
  private readonly params: MessageBoxParams;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get cancelButtonLabel(): string {
    return this.params.cancelButtonLabel;
  }

  public get showCancelButton(): boolean {
    return this.params.showCancelButton;
  }

  public get okButtonLabel(): string {
    return this.params.okButtonLabel;
  }

  public get text(): string {
    return this.params.text;
  }

  public get title(): string {
    return this.params.title;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(
    translateService: TranslateService,
    dialogRef: MatDialogRef<MessageBoxComponent>,
    @Inject(MAT_DIALOG_DATA) params: MessageBoxParams) {
    this.translateService = translateService;
    this.dialogRef = dialogRef;
    this.params = params
    }
  //#endregion

  //#region Angular interface methods -----------------------------------------
  ngOnInit(): void {
    this.params.translateDefaults(this.translateService);
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public cancel(): void {
    this.dialogRef.close();
  }
  //#endregion
}
