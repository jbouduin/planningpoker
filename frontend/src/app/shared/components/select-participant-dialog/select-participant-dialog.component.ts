import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { ParticipantDto } from 'shared-lib';
import { AppTranslationKeys } from '../app-translation-keys';
import { SelectParticipantDialogComponentParams } from './select-participant-dialog.component.params';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-select-participant-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatOptionModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './select-participant-dialog.component.html',
  styleUrl: './select-participant-dialog.component.scss'
})
export class SelectParticipantDialogComponent {
  //#region Private Fields ----------------------------------------------------
  private readonly dialogRef: MatDialogRef<SelectParticipantDialogComponent>;
  private readonly params: SelectParticipantDialogComponentParams;
  //#endregion

  //#region Translation keys --------------------------------------------------
  protected readonly translationKeys = AppTranslationKeys;
  //#endregion

  //#region Protected Fields --------------------------------------------------
  protected readonly formData: FormGroup;
  //#endregion

  //#region Getters: Label Translation keys -----------------------------------
  protected get participants(): Array<ParticipantDto> {
    return this.params.participants;
  }

  protected get participantLabel(): string {
    return this.params.participantLabelKey;
  }

  protected get title(): string {
    return this.params.titleKey;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    dialogRef: MatDialogRef<SelectParticipantDialogComponent>,
    formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) params: SelectParticipantDialogComponentParams
  ) {
    this.params = params;
    this.dialogRef = dialogRef;
    this.formData = formBuilder.group({
      nick: new FormControl('', [Validators.required])
    });
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public cancel(): void {
    this.dialogRef.close();
  }

  public save(): void {
    this.dialogRef.close(this.formData.get('nick')?.value);
  }

  public getErrorMessage(name: string): string | undefined {
    const formControl = this.formData.get(name);
    if (formControl?.hasError('required')) {
      return AppTranslationKeys.INPUT_ERROR_MANDATORY;
    }
    return undefined;
  }
  //#endregion
}
