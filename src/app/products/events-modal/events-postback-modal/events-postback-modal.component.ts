import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import { TrackingService } from '../../../tracking.service';

@Component({
  selector: 'app-events-postback-modal',
  templateUrl: './events-postback-modal.component.html',
  styleUrls: ['./events-postback-modal.component.less']
})
export class EventsPostbackModalComponent implements OnInit {

  postback: string;
  loading = false;
  name: string;

  constructor(public dialogRef: MatDialogRef<EventsPostbackModalComponent>,
    private trackingService: TrackingService,
    @Inject(MAT_DIALOG_DATA) public data) {
    this.name = data.name;
  }

  ngOnInit() {
    this.loading = true;
    this.trackingService.getEventPostBack(this.data.pRef, this.data.id).subscribe(data => {
      this.postback = data.data;
      this.loading = false;
    });
  }

}
