import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['../app.component.less', './spinner.component.less']
})
export class SpinnerComponent {
  color = 'primary';
  mode = 'indeterminate';
  value = 50;

}
