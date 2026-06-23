import { Component, Input } from '@angular/core';
import { Member } from '../../../../core';

@Component({
  selector: 'app-member',
  imports: [],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss'
})
export class MemberComponent {
  @Input({ required: true }) public member!: Member;
}
