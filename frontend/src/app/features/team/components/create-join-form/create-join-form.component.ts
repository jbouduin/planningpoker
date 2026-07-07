import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { CardSetDto, ECardSetType } from 'shared-lib';
import { CardSetSelectItem, CardSetService, extract, SessionService } from '../../../../core';
import {
  AppTranslationKeys,
  CardSetDialogComponent,
  CardSetDialogComponentParams,
  DialogService
} from '../../../../shared';
import { CreateJoinFormMode } from './create-join-form-mode';

@Component({
  selector: 'app-create-join-form',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './create-join-form.component.html',
  styleUrl: './create-join-form.component.scss'
})
export class CreateJoinFormComponent {
  //#region Input -------------------------------------------------------------
  @Input({ required: true }) public formMode!: CreateJoinFormMode;
  //#endregion

  //#region Private Fields ----------------------------------------------------
  private readonly cardSetSvc: CardSetService;
  private readonly dialogSvc: DialogService;
  private readonly sessionSvc: SessionService;
  //#endregion

  //#region Protected Read-only -----------------------------------------------
  protected readonly CARDSET_LABEL = extract('App.Select.CardSet');
  protected readonly OBSERVER_LABEL = extract('Team.Join.Checkbox.Observer');
  protected readonly translationKeys = AppTranslationKeys;
  protected readonly cardSetValues: Array<CardSetSelectItem>;
  //#endregion

  //#region Protected Fields --------------------------------------------------
  protected readonly formData: FormGroup;
  protected observer: boolean;
  //#endregion

  //#region Getters -----------------------------------------------------------
  public get gameHeader(): string {
    return this.formMode === 'create'
      ? extract('Team.Join.Header.Create_a_team')
      : extract('Team.Join.Header.Join_a_team');
  }

  public get submitButtonLabel(): string {
    return this.formMode === 'create' ? extract('Team.Join.Button.Create') : extract('Team.Join.Button.Join');
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // --- Dependency injection ---
    this.sessionSvc = inject(SessionService);
    this.dialogSvc = inject(DialogService);
    this.cardSetSvc = inject(CardSetService);
    const formBuilder = inject(FormBuilder);

    // --- Initialization ---
    this.cardSetValues = this.cardSetSvc.getCardSetSelectItems(true);
    this.formData = formBuilder.group({
      team: new FormControl('', [Validators.required]),
      nick: new FormControl('', [Validators.required]),
      cardSet: new FormControl(ECardSetType.Cohn, [Validators.required])
    });
    this.observer = false;
  }
  //#endregion

  //#region public UI methods -------------------------------------------------
  public getErrorMessage(name: string): string | undefined {
    const formControl = this.formData.get(name);
    if (formControl?.hasError('required')) {
      return AppTranslationKeys.INPUT_ERROR_MANDATORY;
    }
    return undefined;
  }
  //#endregion

  //#region Event triggers ----------------------------------------------------
  public submit(): void {
    if (this.formMode === 'create') {
      const cardSet = this.formData.get('cardSet')?.value as ECardSetType;
      if (cardSet === ECardSetType.Custom) {
        const params: CardSetDialogComponentParams = {
          currentCardSet: this.cardSetSvc.allCardSets[0]
        };
        this.dialogSvc
          .openDialog<CardSetDialogComponent, CardSetDialogComponentParams, CardSetDto | null>(CardSetDialogComponent, {
            width: '600px',
            data: params
          })
          .subscribe((result: CardSetDto | null) => {
            if (result !== null) {
              this.sessionSvc.createSession(
                this.formData.get('team')?.value,
                this.formData.get('nick')?.value,
                this.observer,
                this.formData.get('cardSet')?.value,
                result
              );
            }
          });
      } else {
        this.sessionSvc.createSession(
          this.formData.get('team')?.value,
          this.formData.get('nick')?.value,
          this.observer,
          this.formData.get('cardSet')?.value,
          undefined
        );
      }
    } else {
      this.sessionSvc.joinSession(this.formData.get('team')?.value, this.formData.get('nick')?.value, this.observer);
    }
  }
  //#endregion
}
