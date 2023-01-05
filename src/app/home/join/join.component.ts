import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { GameService } from '../../game/game.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent {

  //#region  @Input
  @Input() public isCreate!: boolean;

  //#endregion
  //#region  Public properties
  public formData: FormGroup;
  public observer: boolean;
  //#endregion

  //#region  Public getter methods
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

  //#region  Constructor&C°
  public constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private gameService: GameService) {
    this.formData = this.formBuilder.group({
      team: new FormControl('', [Validators.required]),
      nick: new FormControl('', [Validators.required])
    });
    this.observer = false;
  }
  //#endregion

  //#region  Public Angular interface methods
  // public ngOnInit(): void { }
  //#endregion

  //#region  Public methods
  public getErrorMessage(name: string): string | undefined {
    const formControl = this.formData.get(name);
    if (formControl?.hasError('required')) {
      return this.translateService.instant('Input.Error.Mandatory');
    }
    return undefined;
  }

  public submit(): void {
    if (this.isCreate) {
      this.gameService.create(
        this.formData.get('team')?.value,
        this.formData.get('nick')?.value,
        this.observer);
    } else {
      this.gameService.join(
        this.formData.get('team')?.value,
        this.formData.get('nick')?.value,
        this.observer);
    }

  }

  //#endregion

}
