import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { GameService } from '../../@core';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {
  public createData: FormGroup;

  constructor(private formBuilder: FormBuilder, private gameService: GameService) {
    this.createData = this.formBuilder.group({
      teamName: new FormControl('', [Validators.required]),
      screenName: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {}

  create(): void {
    this.gameService.create(this.createData.get('teamName')?.value, this.createData.get('screenName')?.value);
  }

  getErrorMessage(name: string) {
    const formControl = this.createData.get(name);
    if (formControl?.hasError('required')) {
      return 'You must enter a value';
    }
    return undefined;
  }
}
