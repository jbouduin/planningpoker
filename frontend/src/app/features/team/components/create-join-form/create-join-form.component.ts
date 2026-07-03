import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { ECardSetType } from 'shared-lib';
import { extract, SessionService } from '../../../../core';
import { CreateJoinFormMode } from './create-join-form-mode';

export interface ICardSetSelectItem {
  set: ECardSetType;
  label: string;
}

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
  @Input({ required: true }) formMode!: CreateJoinFormMode;
  //#endregion

  //#region Private Fields ----------------------------------------------------
  private readonly sessionService: SessionService;
  private _cardSetValues: Array<ICardSetSelectItem>;
  //#endregion

  //#region Protected Read-only -----------------------------------------------
  protected readonly TEAM_LABEL = extract('App.Input.Team.Label');
  protected readonly TEAM_PLACEHOLDER = extract('App.Input.Team.Placeholder');
  protected readonly NICK_LABEL = extract('App.Input.Nick.Label');
  protected readonly NICK_PLACEHOLDER = extract('App.Input.Nick.Placeholder');
  protected readonly CARDSET_LABEL = extract('App.Select.CardSet');
  protected readonly OBSERVER_LABEL = extract('Team.Join.Component.Checkbox.Observer');
  //#endregion

  //#region Protected Fields --------------------------------------------------
  protected formData: FormGroup;
  protected observer: boolean;
  //#endregion

  //#region Getters -----------------------------------------------------------
  public get cardSetValues(): Array<ICardSetSelectItem> {
    return this._cardSetValues;
  }

  public get gameHeader(): string {
    return this.formMode === 'create'
      ? extract('Team.Join.Component.Header.Create_a_team')
      : extract('Team.Join.Component.Header.Join_a_team');
  }

  public get submitButtonLabel(): string {
    return this.formMode === 'create'
      ? extract('Team.Join.Component.Button.Create')
      : extract('Team.Join.Component.Button.Join');
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    sessionService: SessionService,
    private formBuilder: FormBuilder
  ) {
    this.sessionService = sessionService;
    this._cardSetValues = this.getCardSetValues();
    this.formData = this.formBuilder.group({
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
      return extract('App.Input.Error.Mandatory');
    }
    return undefined;
  }
  //#endregion

  //#region Event triggers ----------------------------------------------------
  public submit(): void {
    if (this.formMode === 'create') {
      const cardSet = this.formData.get('cardSet')?.value as ECardSetType;
      if (cardSet === ECardSetType.Custom) {
        // const params: ICardSetDialogParams = {
        //   cardSets: [ECardSetType.Cohn, ECardSetType.Fibonacci, ECardSetType.TShirt],
        //   currentCards: null,
        //   currentCardSet: null
        // };
        // const dialogRef = this.matDialog.open(CardSetDialogComponent, { data: params });
        // dialogRef.afterClosed().subscribe((result: ICardSet) => {
        //   if (result) {
        //     this.sessionService.createSession(
        //       this.formData.get('team')?.value,
        //       this.formData.get('nick')?.value,
        //       this.observer,
        //       this.formData.get('cardSet')?.value,
        //       result
        //     );
        //   }
        // });
      } else {
        this.sessionService.createSession(
          this.formData.get('team')?.value,
          this.formData.get('nick')?.value,
          this.observer,
          this.formData.get('cardSet')?.value,
          undefined
        );
      }
    } else {
      this.sessionService.joinSession(
        this.formData.get('team')?.value,
        this.formData.get('nick')?.value,
        this.observer
      );
    }
  }
  //#endregion

  //#region mock methods ------------------------------------------------------
  private getCardSetValues(): Array<ICardSetSelectItem> {
    // TODO once custom card set is implemented, make this dynamic `Enum.ECardSetType.${ECardSetType[code]}
    return [
      { set: ECardSetType.Cohn, label: extract('Enum.ECardSetType.Cohn') },
      { set: ECardSetType.Fibonacci, label: extract('Enum.ECardSetType.Fibonacci') },
      { set: ECardSetType.TShirt, label: extract('Enum.ECardSetType.TShirt') }
      //{ set: ECardSetType.Custom, label: extract('Enum.ECardSetType.Custom') },
    ];
  }
}
