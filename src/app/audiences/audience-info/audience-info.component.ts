import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-audience-info',
  templateUrl: './audience-info.component.html',
  styleUrls: ['./audience-info.component.less']
})
export class AudienceInfoComponent implements OnInit {

  apiUrl:string = `${environment.audApiUrl}`;
  curlText: string;

  constructor(public dialogRef: MatDialogRef<AudienceInfoComponent>, 
    @Inject(MAT_DIALOG_DATA) public extId: string) { }

  ngOnInit() {
    this.curlText = `curl -u $AUTH_TOKEN:$PASSWORD -X POST ${this.apiUrl}/$AUTH_TOKEN/audiences/${this.extId}/uploads -d "sync_mode=$SYNC_MODE"`;
  }

}
