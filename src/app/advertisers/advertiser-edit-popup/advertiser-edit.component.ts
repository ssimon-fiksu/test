import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray} from '@angular/forms';

import { MyErrorStateMatcher } from '../../error-state-mather';
import { AdvertiserService } from '../advertisers.service';
import { ApiAnswer } from '../../api-answer';
import { Advertiser } from '../advertiser';

const regURL = 'https?://([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-\?\-%$&+,:;=?@#|\'<>.^*()%!-]*/?';

@Component({
  selector: 'app-advertiser-edit',
  templateUrl: './advertiser-edit.component.html',
  styleUrls: ['./advertiser-edit.component.less']
})
export class AdvertiserEditComponent implements OnInit {

  formGroup: FormGroup;
  loading = false;
  clientRef;
  matcher = new MyErrorStateMatcher();

  constructor(public dialogRef: MatDialogRef<AdvertiserEditComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: Advertiser,
    private advertiserService: AdvertiserService,
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.createForm();
    this.clientRef = this.data.client_ref;
    if(!this.data.public_identifier) {
      this.data = new Advertiser();
    } else {
      this.getAdvertiser(this.data.public_identifier);
    }
  }

  get name() {
    return this.formGroup.get('name') as FormControl;
  }

  get adomain() {
    return this.formGroup.get('adomain') as FormControl;
  }

  get advdomain() {
    return this.formGroup.get('advdomain') as FormControl;
  }

  getAdvertiser(id) {
    this.loading = true;
    this.advertiserService.getAdvertiser(id)
    .subscribe((data: ApiAnswer) => {
      this.loading = false;
      this.data = data.data;
      this.name.setValue(this.data.name);
      this.adomain.setValue(this.data.adomain);
      this.advdomain.setValue(this.data.advertiser_url);
    });
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'name': [null, Validators.required],
      'adomain': [null, Validators.required],
      'advdomain': [null, Validators.pattern(regURL)]
    });
  }

  save() {
    if(this.loading) return;
    this.data.name = this.name.value;
    this.data.advertiser_url = this.advdomain.value;
    this.data.adomain = this.adomain.value;
    this.data.client_ref = this.clientRef;
    this.loading = true;
    let action = this.data.public_identifier ? 'updateAdvertiser' : 'createAdvertiser';
    this.advertiserService[action](this.data)
    .subscribe((data: ApiAnswer) => {
      this.loading = false;
      if(data.success) {
        this.dialogRef.close(data.data);
      }
    });
  }

}
