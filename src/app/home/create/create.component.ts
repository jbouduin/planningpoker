import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { GameService } from '../../game/game.service';

// TODO (#702) create and join component are almost the same
@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  // <editor-fold desc='Public properties'>
  public createData: FormGroup;
  // </editor-fold>

  // <editor-fold desc='Public getter methods'>
  public get joinButtonLabel(): string {
    return this.translateService.instant('Home.Component.ButtonLabel.Join');
  }

  public get nickNameLabel(): string {
    return this.translateService.instant('Home.Component.InputLabel.NickName');
  }

  public get nickNamePlaceHolder(): string {
    return this.translateService.instant('Home.Component.InputPlaceholder.NickName');
  }

  public get startButtonLabel(): string {
    return this.translateService.instant('Home.Component.ButtonLabel.Start');
  }

  public get startGameHeader(): string {
    return this.translateService.instant('Home.Component.Header.Start_a_game');
  }

  public get joinGameHeader(): string {
    return this.translateService.instant('Home.Component.Header.Join_a_game');
  }

  public get teamNameLabel(): string {
    return this.translateService.instant('Home.Component.InputLabel.TeamName.Label');
  }

  public get teamNamePlaceHolder(): string {
    return this.translateService.instant('Home.Component.InputPlaceholder.TeamName');
  }
  // </editor-fold>

  // <editor-fold desc='Constructor&C°'>
  public constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private gameService: GameService) {
    this.createData = this.formBuilder.group({
      team: new FormControl('', [Validators.required]),
      nick: new FormControl('', [Validators.required])
    });
  }
  // </editor-fold>

  // <editor-fold desc='Public Angular interface methods'>
  public ngOnInit(): void {}
  // </editor-fold>

  // <editor-fold desc='UI triggered methods'>
  public create(): void {
    this.gameService.create(this.createData.get('team')?.value, this.createData.get('nick')?.value);
  }

  public getErrorMessage(name: string): string | undefined {
    const formControl = this.createData.get(name);
    if (formControl?.hasError('required')) {
      return this.translateService.instant('Input.Error.Mandatory');
    }
    return undefined;
  }
  // </editor-fold>
}
