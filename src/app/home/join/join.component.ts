import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { GameService } from '../../@core';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit {

  // <editor-fold desc='Public properties'>
  public joinData: FormGroup;
  // </editor-fold>

  // <editor-fold desc='Constructor&C°'>
  public constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private gameService: GameService) {
    this.joinData = this.formBuilder.group({
      team: new FormControl('', [Validators.required]),
      nick: new FormControl('', [Validators.required])
    });
  }
  // </editor-fold>

  // <editor-fold desc='Public Angular interface methods'>
  public ngOnInit(): void {}
  // </editor-fold>

  // <editor-fold desc='Public methods'>
  public join(): void {
    this.gameService.join(this.joinData.get('team')?.value, this.joinData.get('nick')?.value);
  }

  public getErrorMessage(name: string): string | undefined {
    const formControl = this.joinData.get(name);
    if (formControl?.hasError('required')) {
      return this.translateService.instant('You must enter a value');
    }
    return undefined;
  }
  // </editor-fold>

}
