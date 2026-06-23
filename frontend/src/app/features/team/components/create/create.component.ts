import { Component } from '@angular/core';
import { CreateJoinFormComponent } from '../create-join-form/create-join-form.component';
import { ECreateJoinFormMode } from '../create-join-form/create-join-form-mode';

@Component({
  selector: 'app-create',
  imports: [CreateJoinFormComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  //#region Protected Read-only -----------------------------------------------
  protected readonly EFormMode = ECreateJoinFormMode;
  //#endregion
}
