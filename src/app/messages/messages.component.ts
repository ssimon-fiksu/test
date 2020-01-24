import { Component, Inject } from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['../app.component.less', './messages.component.less']
})
export class MessagesComponent {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: []) { }
  
}
