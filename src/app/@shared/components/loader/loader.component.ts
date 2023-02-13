import { Component, Input } from '@angular/core';

@Component({
  selector: 'common-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  @Input() isLoading = false;
  @Input() size = 1;
  @Input() message: string | undefined;

  // constructor() {}

  // ngOnInit() {}
}
