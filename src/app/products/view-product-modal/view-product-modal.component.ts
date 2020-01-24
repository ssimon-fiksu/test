import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith, tap} from 'rxjs/operators';
import { MyErrorStateMatcher } from '../../error-state-mather';
import { ApiAnswer } from '../../api-answer';

import { ProductsService } from '../products.service';
import { TrackingService } from '../../tracking.service';
import { InfoService } from '../../info.service';

@Component({
  selector: 'app-view-product-modal',
  templateUrl: './view-product-modal.component.html',
  styleUrls: ['./view-product-modal.component.less']
})
export class ViewProductModalComponent implements OnInit {

  formGroup: FormGroup;
  loading = false;
  macroses: Array<string>;
  partners: any[];
  selectedPartnId;
  selectedPartner;
  device_class;
  selectedCatIds: string[];

  constructor(public dialogRef: MatDialogRef<ViewProductModalComponent>, 
    @Inject(MAT_DIALOG_DATA) public data,
    private productsService: ProductsService,
    private trackingService: TrackingService,
    public dialog: MatDialog,
    private infoService: InfoService,
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.getPartners();
    this.createForm();
    this.getLinks();
  }

  get tracking_partner_id() {
    return this.formGroup.get('tracking_partner_id') as FormControl;
  }

  get category_ids() {
    return this.formGroup.get('category_ids') as FormControl;
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'impression_url': [null],
      'click_url': [null],
      'is_async_click': [{'value': false, 'disabled': true}],
      'min_allowed_age': [null],
      'tracking_partner_id': [null],
      'category_ids': []
    });
  }

  getLinks() {
    this.loading = true;
    this.productsService.getUrls(this.data.advRef, this.data.appRef)
     .subscribe((data: ApiAnswer) => {
        this.loading = false;
        this.formGroup.patchValue(data.data);
        this.selectedCatIds = this.category_ids.value;
        this.tracking_partner_id.value && this.partners && this.setPartner();
    });
  }

  setPartner() {
    this.selectedPartner = this.partners.filter(partner => partner.id == this.tracking_partner_id.value)[0];
  }

  getPartners() {
    this.trackingService.getPartners(this.data.clientRef).subscribe(data => {
      this.partners = data;
      this.tracking_partner_id.value && this.partners && this.setPartner();
    });
  }
}
