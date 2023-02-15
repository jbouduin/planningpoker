import { Component, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CardSetDialogComponent } from '@app/@shared/components/card-set-dialog/card-set-dialog.component';
import { ICardSetDialogParams } from '@app/@shared/components/card-set-dialog/card-set-dialog.params';
import { CardSetService, ICardSetSelectItem } from '@app/@shared/services/card-set.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ECardSet, ICardSet } from '@shared-lib';
import { Subscription } from 'rxjs';
import { SessionService } from '../../../session/services/session.service';

@Component({
  selector: 'home-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnDestroy {

  //#region @Input ------------------------------------------------------------
  @Input() public isCreate!: boolean;
  //#endregion

  //#region private properties ------------------------------------------------
  private readonly cardSetService: CardSetService;
  private readonly formBuilder: FormBuilder;
  private readonly languageChangeSubscription: Subscription;
  private readonly matDialog: MatDialog;
  private readonly sessionService: SessionService;
  private readonly translateService: TranslateService;
  private _cardSetValues: Array<ICardSetSelectItem>;
  //#endregion

  //#region Public properties -------------------------------------------------
  public formData: FormGroup;
  public observer: boolean;
  //#endregion

  //#region Public getter methods ---------------------------------------------
  public get cardSetLabel(): string {
    return this.translateService.instant('Home.Component.SelectLabel.CardSet');
  }

  public get cardSetValues(): Array<ICardSetSelectItem> {
    return this._cardSetValues;
  }

  public get gameHeader(): string {
    return this.isCreate ?
      this.translateService.instant('Home.Component.Header.Start_a_game') :
      this.translateService.instant('Home.Component.Header.Join_a_game');
  }

  public get nickNameLabel(): string {
    return this.translateService.instant('Home.Component.InputLabel.NickName');
  }

  public get nickNamePlaceHolder(): string {
    return this.translateService.instant('Home.Component.InputPlaceholder.NickName');
  }

  public get observerLabel(): string {
    return this.translateService.instant('Home.Component.CheckboxLabel.Observer');
  }

  public get submitButtonLabel(): string {
    return this.isCreate ?
      this.translateService.instant('Home.Component.ButtonLabel.Start') :
      this.translateService.instant('Home.Component.ButtonLabel.Join');
  }

  public get teamNameLabel(): string {
    return this.translateService.instant('Home.Component.InputLabel.TeamName.Label');
  }

  public get teamNamePlaceHolder(): string {
    return this.translateService.instant('Home.Component.InputPlaceholder.TeamName');
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    cardSetService: CardSetService,
    formBuilder: FormBuilder,
    matDialog: MatDialog,
    sessionService: SessionService,
    translateService: TranslateService) {
    this.cardSetService = cardSetService;
    this.formBuilder = formBuilder;
    this.matDialog = matDialog;
    this.sessionService = sessionService;
    this.translateService = translateService;
    this._cardSetValues = this.cardSetService.getCardSetSelectItems();
    this.formData = this.formBuilder.group({
      team: new FormControl('', [Validators.required]),
      nick: new FormControl('', [Validators.required]),
      cardSet: new FormControl(ECardSet.Cohn, [Validators.required])
    });
    this.languageChangeSubscription = this.translateService.onLangChange
      .subscribe((_event: LangChangeEvent) => this._cardSetValues = this.cardSetService.getCardSetSelectItems());
    this.observer = false;
  }

  public ngOnDestroy() {
    if (this.languageChangeSubscription) {
      this.languageChangeSubscription.unsubscribe();
    }
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public getErrorMessage(name: string): string | undefined {
    const formControl = this.formData.get(name);
    if (formControl?.hasError('required')) {
      return this.translateService.instant('Input.Error.Mandatory');
    }
    return undefined;
  }

  public submit(): void {
    if (this.isCreate) {
      const cardSet = this.formData.get('cardSet')?.value;
      if (cardSet === ECardSet.Custom) {
        const params: ICardSetDialogParams = {
          cardSets: [ECardSet.Cohn, ECardSet.Fibonacci, ECardSet.TShirt],
          currentCards: null,
          currentCardSet: null
        }
        const dialogRef = this.matDialog.open(CardSetDialogComponent, {data: params});
        dialogRef.afterClosed().subscribe((result: ICardSet) => {
          if (result) {
            this.sessionService.create(
              this.formData.get('team')?.value,
              this.formData.get('nick')?.value,
              this.observer,
              this.formData.get('cardSet')?.value,
              result
            );
          }
        });
      } else {
        this.sessionService.create(
          this.formData.get('team')?.value,
          this.formData.get('nick')?.value,
          this.observer,
          this.formData.get('cardSet')?.value,
          undefined);
      }
    } else {
      this.sessionService.join(
        this.formData.get('team')?.value,
        this.formData.get('nick')?.value,
        this.observer);
    }
  }
  //#endregion

  //#region private methods ---------------------------------------------------

  //#endregion
}
