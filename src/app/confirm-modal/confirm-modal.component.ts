import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.less']
})
export class ConfirmModalComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmModalComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: string) { }

  onSubmit() {
    this.dialogRef.close(true);
  }

}
