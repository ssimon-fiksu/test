import { Component, Inject, OnInit, } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MyErrorStateMatcher } from '../../error-state-mather';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';

import { CampaignsService } from '../campaigns.service';
import { ApiAnswer } from '../../api-answer';
import { CampaignForm } from './campaignForm';
import { Campaign } from '../campaign';
import { Product } from '../../products/product';
import { ClickcapComponent } from '../../caps-modal/clickcap-modal/clickcap.component';
import { ImpressioncapComponent } from '../../caps-modal/impressioncap-modal/impressioncap.component';
import { ImpCaps } from '../../caps-modal/impressioncap-modal/impCaps';
import { ClickCaps } from '../../caps-modal/clickcap-modal/clickCaps';

export class Data {
  product: Product
  camp: Campaign
}

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'YYYY-MM-DD',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

const regInt = '^-?[0-9][^\.]*$';

@Component({
  selector: 'app-edit-campaign',
  templateUrl: './edit-campaign.component.html',
  styleUrls: ['./edit-campaign.component.less'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})

export class EditCampaignComponent implements OnInit {

  loading: boolean = false;
  sizes = [];
  formGroup: FormGroup;
  toSave: CampaignForm = new CampaignForm();
  impCaps: ImpCaps = new ImpCaps();
  clickCaps: ClickCaps = new ClickCaps();
  today = moment(new Date().setHours(0,0,0,0));
  matcher = new MyErrorStateMatcher();

  constructor(public dialogRef: MatDialogRef<EditCampaignComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: Data,
    private campService: CampaignsService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog) {
  }

  ngOnInit() {
    this.createFormGroup();
    this.toSave.p_ref = this.data.product.p_ref;
    if(!this.data.camp) {
      this.getDefaultCaps();
    } else {
      this.toSave.public_identifier = this.data.camp.public_identifier;
      this.getCampaign(this.data.camp.public_identifier);
    }
  }

  get name() {
    return this.formGroup.get('name') as FormControl;
  }

  get budget() {
    return this.formGroup.get('budget') as FormControl;
  }

  get start_date() {
    return this.formGroup.get('start_date') as FormControl;
  }

  get end_date() {
    return this.formGroup.get('end_date') as FormControl;
  }

  endDatefilter = (d): boolean => {
    return d >= this.start_date.value;
  }

  dateChange() {
    if(this.end_date.value < this.start_date.value) {
      this.end_date.setErrors({
        invalid: true,
      });
    } else {
      this.end_date.setErrors({
        invalid: null,
      });
      this.end_date.updateValueAndValidity();
    }
  }

  createFormGroup() {
    this.formGroup = this.formBuilder.group({
      'name': [{value: null, disabled: this.loading}, Validators.required],
      'start_date': [{value: this.today, disabled: this.loading}, Validators.required],
      'end_date': [{value: this.today, disabled: this.loading}, Validators.required],
      'budget': [{value: null, disabled: this.loading}, [Validators.required, Validators.pattern(regInt), Validators.min(0)]]
    });
  }


  getCampaign(id) {
    this.loading = true;
    this.campService.getCampaign(id)
      .subscribe((data: ApiAnswer) => {
        this.loading = false;
        this.name.setValue(data.data.name);
        this.start_date.setValue(moment(data.data.start_date));
        this.end_date.setValue(moment(data.data.end_date));
        this.budget.setValue(data.data.budget);
        this.dateChange();
        this.setCaps(data.data);
      });
  }

  getDefaultCaps() {
    this.loading = true;
    this.campService.getDefaultCaps()
    .subscribe((data: ApiAnswer) => {
        this.loading = false;
        this.setCaps(data.data);
      });
  }

  setCaps(data) {
    this.impCaps.impression_cap_daily = data.impression_cap_daily != undefined ? data.impression_cap_daily : this.impCaps.impression_cap_daily;
    this.impCaps.impression_cap_hourly = data.impression_cap_hourly != undefined ? data.impression_cap_hourly : this.impCaps.impression_cap_hourly;
    this.impCaps.impression_cap_monthly = data.impression_cap_monthly != undefined ? data.impression_cap_monthly : this.impCaps.impression_cap_monthly;
    this.clickCaps.click_cap_daily = data.click_cap_daily != undefined ? data.click_cap_daily : this.clickCaps.click_cap_daily;
    this.clickCaps.click_cap_monthly = data.click_cap_monthly != undefined ? data.click_cap_monthly : this.clickCaps.click_cap_monthly;
  }

  impressionCapOpen() {
    const dialogRef = this.dialog.open(ImpressioncapComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: this.impCaps
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data) {
        this.setCaps(data);
      }
    });
  }

  clickCapOpen() {
    const dialogRef = this.dialog.open(ClickcapComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: this.clickCaps
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data) {
        this.setCaps(data);
      }
    });
  }

  save() {
    if(this.loading) return;
    this.toSave.name = this.name.value;
    this.toSave.budget = this.budget.value;
    this.toSave.start_date = this.start_date.value.format(MY_FORMATS.parse.dateInput);
    this.toSave.end_date = this.end_date.value.format(MY_FORMATS.parse.dateInput);
    Object.assign( this.toSave, this.impCaps, this.clickCaps );
    this.loading = true;
    let action = this.toSave.public_identifier ? 'updateCampaign' : 'createCampaign';
    this.campService[action](this.toSave)
    .subscribe((data: ApiAnswer) => {
      this.loading = false;
      if(data.success) {
        this.dialogRef.close(data.data);
      }
    });
  }

}
