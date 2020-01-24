import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyErrorStateMatcher } from '../../error-state-mather';

import { ClickCaps } from './clickCaps';

const regInt = '^-?[0-9][^\.]*$';

@Component({
  selector: 'app-clickcap',
  templateUrl: './clickcap.component.html',
  styleUrls: ['./clickcap.component.less']
})
export class ClickcapComponent implements OnInit {

  formGroup: FormGroup;
  matcher = new MyErrorStateMatcher();
  newCaps: ClickCaps = new ClickCaps();

  constructor(public dialogRef: MatDialogRef<ClickcapComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: ClickCaps,
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.createFormGroup();
  }

  get day() {
    return this.formGroup.get('day') as FormControl;
  }

  get month() {
    return this.formGroup.get('month') as FormControl;
  }

  createFormGroup() {
    this.formGroup = this.formBuilder.group({
      'day': [this.data.click_cap_daily, [Validators.pattern(regInt), Validators.required, Validators.min(1), Validators.max(65535)]],
      'month': [this.data.click_cap_monthly, [Validators.pattern(regInt), Validators.required, Validators.min(1), Validators.max(65535)]]
    });
  }

  confirm() {
    this.newCaps.click_cap_daily = this.day.value;
    this.newCaps.click_cap_monthly = this.month.value;
    this.dialogRef.close(this.newCaps);
  }

}
