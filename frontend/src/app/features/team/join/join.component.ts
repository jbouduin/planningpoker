import { Component } from '@angular/core';
import { CreateJoinFormComponent } from '../components/create-join-form.component';

@Component({
  selector: 'app-join',
  imports: [CreateJoinFormComponent],
  templateUrl: './join.component.html',
  styleUrl: './join.component.scss'
})
export class JoinComponent {}
