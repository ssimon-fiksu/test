import { Component, Inject, OnInit, } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { CampaignsService } from '../campaigns.service';
import { ApiAnswer } from '../../api-answer';
import { Campaign } from '../campaign';

@Component({
  selector: 'app-view-campaign-modal',
  templateUrl: './view-campaign-modal.component.html',
  styleUrls: ['./view-campaign-modal.component.less']
})
export class ViewCampaignModalComponent implements OnInit {

  loading: boolean = false;
  formGroup: FormGroup;

  constructor(public dialogRef: MatDialogRef<ViewCampaignModalComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: Campaign,
    private campService: CampaignsService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog) {
  }

  ngOnInit() {
    this.createFormGroup();
    this.getCampaign(this.data.public_identifier);
  }

  createFormGroup() {
    this.formGroup = this.formBuilder.group({
      'name': [{value: null, disabled: this.loading}],
      'start_date': [{value: null, disabled: this.loading}],
      'end_date': [{value: null, disabled: this.loading}],
      'budget': [{value: null, disabled: this.loading}],
      'click_cap_daily': [{value: null, disabled: this.loading}],
      'click_cap_monthly': [{value: null, disabled: this.loading}],
      'impression_cap_daily': [{value: null, disabled: this.loading}],
      'impression_cap_hourly': [{value: null, disabled: this.loading}],
      'impression_cap_monthly': [{value: null, disabled: this.loading}]
    });
  }

  getCampaign(id) {
    this.loading = true;
    this.campService.getCampaign(id)
      .subscribe((data: ApiAnswer) => {
        this.loading = false;
        this.formGroup.patchValue(data.data);
      });
  }
}
