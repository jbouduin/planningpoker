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

  // <editor-fold desc='Public methods'>
  create(): void {
    this.gameService.create(this.createData.get('team')?.value, this.createData.get('nick')?.value);
  }

  getErrorMessage(name: string): string | undefined {
    const formControl = this.createData.get(name);
    if (formControl?.hasError('required')) {
      return this.translateService.instant('You must enter a value');
    }
    return undefined;
  }
  // </editor-fold>
}
