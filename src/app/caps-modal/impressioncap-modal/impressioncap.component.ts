import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyErrorStateMatcher } from '../../error-state-mather';

import { ImpCaps } from './impCaps';

const regInt = '^-?[0-9][^\.]*$';

@Component({
  selector: 'app-impressioncap',
  templateUrl: './impressioncap.component.html',
  styleUrls: ['./impressioncap.component.less']
})
export class ImpressioncapComponent implements OnInit {

  formGroup: FormGroup;
  matcher = new MyErrorStateMatcher();
  newCaps: ImpCaps = new ImpCaps();

  constructor(public dialogRef: MatDialogRef<ImpressioncapComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: ImpCaps,
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.createFormGroup();
  }

  get hour() {
    return this.formGroup.get('hour') as FormControl;
  }

  get day() {
    return this.formGroup.get('day') as FormControl;
  }

  get month() {
    return this.formGroup.get('month') as FormControl;
  }

  createFormGroup() {
    this.formGroup = this.formBuilder.group({
      'hour': [this.data.impression_cap_hourly, [Validators.pattern(regInt), Validators.required, Validators.min(1), Validators.max(65535)]],
      'day': [this.data.impression_cap_daily, [Validators.pattern(regInt), Validators.required, Validators.min(1), Validators.max(65535)]],
      'month': [this.data.impression_cap_monthly, [Validators.pattern(regInt), Validators.required, Validators.min(1), Validators.max(65535)]]
    });
  }

  confirm() {
    this.newCaps.impression_cap_hourly = this.hour.value;
    this.newCaps.impression_cap_daily = this.day.value;
    this.newCaps.impression_cap_monthly = this.month.value;
    this.dialogRef.close(this.newCaps);
  }

}
