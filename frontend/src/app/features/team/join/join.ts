import { Component } from '@angular/core';
import { CreateJoinForm } from '../components/create-join-form';

@Component({
  selector: 'app-join',
  imports: [CreateJoinForm],
  templateUrl: './join.html',
  styleUrl: './join.scss',
})
export class Join {}
