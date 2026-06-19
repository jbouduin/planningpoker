import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ECardSet } from 'shared-lib';
import { SessionService } from '../../../core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import type { ECardSet as ECardSetType } from 'shared-lib';


export interface ICardSetSelectItem {
  set: ECardSetType;
  label: string;
}

@Component({
  selector: 'app-create-join-form',
  imports: [FormsModule, ReactiveFormsModule, MatInputModule, MatCardModule, MatCheckboxModule, MatFormFieldModule, MatOptionModule, MatSelectModule, CommonModule],
  templateUrl: './create-join-form.component.html',
  styleUrl: './create-join-form.component.scss',
})
export class CreateJoinFormComponent {
  //#region Input -------------------------------------------------------------
  @Input({ required: true }) isCreate!: boolean;
  //#endregion

  //#region private properties ------------------------------------------------
  private readonly sessionService: SessionService;
  private _cardSetValues: Array<ICardSetSelectItem>;
  //#endregion

  //#region Public properties -------------------------------------------------
  public formData: FormGroup;
  public observer: boolean;
  //#endregion

  //#region Getters -----------------------------------------------------------
  public get cardSetLabel(): string {
    return "Card set"; // this.translateService.instant('Component.Select.CardSet.Label');
  }

  public get cardSetValues(): Array<ICardSetSelectItem> {
    return this._cardSetValues;
  }

  public get gameHeader(): string {
    return this.isCreate ?
      "Create a Team" : // this.translateService.instant('Join.Component.Header.Start_a_team') :
      "Join a Team"; //this.translateService.instant('Join.Component.Header.Join_a_team');
  }
  public get nickNameLabel(): string {
    return "Nick"; // this.translateService.instant('Component.Input.Nick.Label');
  }

  public get nickNamePlaceHolder(): string {
    return "Enter your nickname"; //this.translateService.instant('Component.Input.Nick.PlaceHolder');
  }

  public get observerLabel(): string {
    return "I will not estimate";  // this.translateService.instant('Join.Component.Checkbox.Observer.Label');
  }

  public get submitButtonLabel(): string {
    return this.isCreate ?
      "Create Team" : // this.translateService.instant('Join.Component.Button.Start.Label') :
      "Join Team"; //this.translateService.instant('Join.Component.Button.Join.Label');
  }

  public get teamNameLabel(): string {
    return "Team name";  // this.translateService.instant('Join.Component.Input.Team.Label');
  }

  public get teamNamePlaceHolder(): string {
    return "Enter a team name";  // this.translateService.instant('Join.Component.Input.Team.PlaceHolder');
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(sessionService: SessionService, private formBuilder: FormBuilder) {
    this.sessionService = sessionService;
    this._cardSetValues = this.getCardSetValues();
    this.formData = this.formBuilder.group({
      team: new FormControl('', [Validators.required]),
      nick: new FormControl('', [Validators.required]),
      cardSet: new FormControl(ECardSet.Cohn, [Validators.required])
    });
    this.observer = false;
  }

  public getErrorMessage(name: string): string | undefined {
    const formControl = this.formData.get(name);
    if (formControl?.hasError('required')) {
      return "Field is mandatory"; // this.translateService.instant('Component.Error.Mandatory');
    }
    return undefined;
  }
  //#endregion

  //#region Event triggers ----------------------------------------------------
  public submit(): void {
    if (this.isCreate) {
      const cardSet = this.formData.get('cardSet')?.value;
      if (cardSet === ECardSet.Custom) {
        // const params: ICardSetDialogParams = {
        //   cardSets: [ECardSet.Cohn, ECardSet.Fibonacci, ECardSet.TShirt],
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
          undefined);
      }
    } else {
      this.sessionService.joinSession(
        this.formData.get('team')?.value,
        this.formData.get('nick')?.value,
        this.observer);
    }
  }
  //#endregion

  //#region mock methods ------------------------------------------------------
  public get formMode(): string {
    return this.isCreate ? "Create" : "Join";
  }

  private getCardSetValues(): Array<ICardSetSelectItem> {
    return [
      { set: ECardSet.Cohn, label: "Cohn" },
      { set: ECardSet.Fibonacci, label: "Fibonacci" },
      { set: ECardSet.TShirt, label: "T-Shirt" }
      //{ set: ECardSet.Custom, label: "Cohn" },
    ];
  }
}
