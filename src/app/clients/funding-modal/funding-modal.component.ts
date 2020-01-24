import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';

import { MyErrorStateMatcher } from '../../error-state-mather';
import { ApiAnswer } from '../../api-answer';

import { ClientService } from '../client.service';
import { Client } from '../client';

@Component({
  selector: 'app-funding-modal',
  templateUrl: './funding-modal.component.html',
  styleUrls: ['./funding-modal.component.less']
})
export class FundingModalComponent {

  matcher = new MyErrorStateMatcher();
  loading = false;

  constructor(public dialogRef: MatDialogRef<FundingModalComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: Client,
    private clientService: ClientService) { }

  fundsFormControl = new FormControl('', [
    Validators.required
  ]);


  updateFunds() {
    if(this.loading) return;
    this.loading = true;
    this.clientService.updateFunds({'delta_funds': this.fundsFormControl.value}, this.data.client_api_ref)
    .subscribe((data: ApiAnswer) => {
      if(data.success) {
        this.dialogRef.close(data.data.balance);
      }
      this.loading = false;
    });
  }
}
