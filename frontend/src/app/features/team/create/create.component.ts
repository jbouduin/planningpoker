import { Component } from '@angular/core';
import { CreateJoinFormComponent } from '../components/create-join-form.component';

@Component({
  selector: 'app-create',
  imports: [CreateJoinFormComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {}
