import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { GameService } from '../../@core';


@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit {

  public joinData: FormGroup;
  // constructor
  constructor(private formBuilder: FormBuilder, private gameService: GameService) {
    this.joinData = this.formBuilder.group({
      team: new FormControl('', [Validators.required]),
      nick: new FormControl('', [Validators.required])
    });
  }

  join(): void {
    this.gameService.join(this.joinData.get('team')?.value, this.joinData.get('nick')?.value);
  }

  getErrorMessage(name: string) {
    const formControl = this.joinData.get(name);
    if (formControl?.hasError('required')) {
      return 'You must enter a value';
    }
    return undefined;
  }

  ngOnInit(): void {}
}
