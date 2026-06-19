import { Component } from '@angular/core';
import { CreateJoinForm } from '../components/create-join-form';

@Component({
  selector: 'app-create',
  imports: [CreateJoinForm],
  templateUrl: './create.html',
  styleUrl: './create.scss',
})
export class Create {}
