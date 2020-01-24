import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormControl, Validators} from '@angular/forms';

import { MyErrorStateMatcher } from '../../error-state-mather';
import {AccountService} from '../account.service';
import { ApiAnswer } from '../../api-answer';

export interface Funding {
  funds_remaining: number;
  id: string
}

@Component({
  selector: 'app-funding-popup',
  templateUrl: './funding-popup.component.html',
  styleUrls: ['./funding-popup.component.less']
})
export class FundingPopupComponent {

  matcher = new MyErrorStateMatcher();
  loading = false;

  constructor(public dialogRef: MatDialogRef<FundingPopupComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: Funding,
    private accountService: AccountService) { }

  fundsFormControl = new FormControl('', [
    Validators.required
  ]);


  addFunds(value) {
    if(this.loading) return;
    this.loading = true;
    this.accountService.addFunds({delta_funds: value}, this.data.id)
    .subscribe((data: ApiAnswer) => {
      this.dialogRef.close(data.data[0]);
      this.loading = false;
    });
  }
}
