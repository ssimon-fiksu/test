import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray} from '@angular/forms';

import { MyErrorStateMatcher } from '../../error-state-mather';
import { IOService } from '../order.service';
import { ApiAnswer } from '../../api-answer';
import { IO } from '../order';
import { AdvertiserService } from '../../advertisers/advertisers.service';
import { Advertiser } from '../../advertisers/advertiser';

@Component({
  selector: 'app-order-edit',
  templateUrl: './order-edit.component.html',
  styleUrls: ['./order-edit.component.less']
})
export class OrderEditComponent implements OnInit {

  formGroup: FormGroup;
  loading = false;
  advertisers: Advertiser[] = [];
  file: File;
  matcher = new MyErrorStateMatcher();

  constructor(public dialogRef: MatDialogRef<OrderEditComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: IO,
    private ioService: IOService,
    private advService: AdvertiserService,
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.createForm();
    if(!this.data.public_identifier) {
      this.loadAdvrtrs();
      this.data = new IO();
    } else {
       this.getOrder(this.data.public_identifier);
    }
  }

  get name() {
    return this.formGroup.get('name') as FormControl;
  }

  get adv() {
    return this.formGroup.get('adv') as FormControl;
  }

  getOrder(id) {
    this.loading = true;
    this.ioService.getOrder(id)
    .subscribe((data: ApiAnswer) => {
      this.loading = false;
      this.data = data.data;
      this.name.setValue(this.data.name);
      this.adv.setValue(this.data.advertiser_name);
    });
  }

  loadAdvrtrs() {
     this.advService.getAdvertisers(this.data.client_ref)
      .subscribe((data: ApiAnswer) => {
        if(data.data && data.data.length > 0) {
          this.advertisers = data.data;
        }
      });
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'name': [null, Validators.required],
      'adv': [null, Validators.required]
    });
  }

  handleFileInput(e) {
    this.file = e[0];
  }

  create() {
    if(this.loading) return;
    let formData = {
      "upload_file":  this.file,
      "name": this.name.value,
      "advertiser_public_id": this.adv.value
    }
    this.loading = true;
    this.ioService.createOrder(formData)
    .subscribe((data: ApiAnswer) => {
      this.loading = false;
      if(data.success) {
        this.dialogRef.close(data);
      }
    });
  }

  update() {
    if(this.loading) return;
    this.loading = true;
    this.ioService.updateOrder({"name": this.name.value, "public_identifier": this.data.public_identifier})
    .subscribe((data: ApiAnswer) => {
      this.loading = false;
      if(data.success) {
        this.dialogRef.close(data);
      }
    });
  }

}
