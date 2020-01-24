import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AudienceService } from '../audience.service';

import { ApiAnswer } from '../../api-answer';

@Component({
  selector: 'app-upload-audience',
  templateUrl: './upload-audience.component.html',
  styleUrls: ['./upload-audience.component.less']
})
export class UploadAudienceComponent {

  loading = false;
  uploadType = "file";
  mode = "ADD";
  file: File;
  error = false;

  constructor(public dialogRef: MatDialogRef<UploadAudienceComponent>, 
    @Inject(MAT_DIALOG_DATA) public data,
    private audienceService: AudienceService) { 
  }

  handleFileInput(e) {
    this.file = e[0];
  }

  linkFormControl = new FormControl('', [
    Validators.pattern('s3://.+'), Validators.required
  ]);

  upload() {
    this.error = false;
    if(this.uploadType == "file" && !this.file) {
      this.error = true;
      return;
    }
    if(this.linkFormControl.errors && this.uploadType == "link") {
      return;
    }
    let data = {
      "upload_file":  this.file,
      "external_id": this.data.external_id,
      "client_ref": this.data.client_api_ref,
      "sync_mode": this.mode,
      "uploading_type": this.uploadType,
      "s3_link": this.linkFormControl.value
    }
    this.loading = true;
    this.audienceService.uploadAudience(data).subscribe((data: ApiAnswer) => {
      this.loading = false;
      if(data.success) {
        this.dialogRef.close();
      }      
    });
  }

}
