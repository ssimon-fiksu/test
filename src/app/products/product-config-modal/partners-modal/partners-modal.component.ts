import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyErrorStateMatcher } from '../../../error-state-mather';
import {Observable} from 'rxjs';
import {map, startWith, tap} from 'rxjs/operators';

import { TrackingService } from '../../../tracking.service';

export class Data {
  partners: any[];
  selected: any;
  clientRef: string
}

@Component({
  selector: 'app-partners-modal',
  templateUrl: './partners-modal.component.html',
  styleUrls: ['./partners-modal.component.less']
})
export class PartnersModalComponent implements OnInit {

  partnerCtrl = new FormControl();
  partner;
  partners: Observable<any[]>;
  filtered;
  formGroup: FormGroup;
  showForm = false;
  loading = false;
  error = false;

  constructor(public dialogRef: MatDialogRef<PartnersModalComponent>, 
    private formBuilder: FormBuilder,
    private trackingService: TrackingService,
    @Inject(MAT_DIALOG_DATA) public data: Data) {
    
  }

  ngOnInit() {
    this.createForm();
    this.partnerCtrl.setValue(this.data.selected);
    this.parsePartners();
  }

  getPartners() {
    this.trackingService.getPartners(this.data.clientRef).subscribe(data => {
      this.loading = false;
      this.showForm = false;
      this.data.partners = data;
      this.partnerCtrl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
      }
    );
  }

  parsePartners() {
    this.partners = this.partnerCtrl.valueChanges
      .pipe(
        startWith(null),
        map(part => {
          this.filtered = part ? this._filterStates(this.data.partners, part) : this.data.partners.slice(); 
          return this.filtered;
        })
      );
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'name': [null, Validators.required],
      'id': [null],
      'client_ref': [this.data.clientRef]
    });
  }

  edit() {
    this.error = false;
    this.showForm = true;
    this.formGroup.get('name').setValue(this.partnerCtrl.value.name);
    this.formGroup.get('id').setValue(this.partnerCtrl.value.id);
  }

  create() {
    this.error = false;
    this.showForm = true;
    this.formGroup.get('name').setValue(this.partnerCtrl.value);
    this.formGroup.get('id').setValue(null);
  }

  save() {
    if(this.loading) return;
    this.loading = true;

    this.trackingService[this.formGroup.value.id ? 'updatePartner' : 'createPartner'](this.formGroup.value)
    .subscribe(data => {
      if(data.success) {
        this.partnerCtrl.setValue(data.data);
        this.getPartners();
      } else this.loading = false;
      
    });
  }

  confirm() {
    this.error = false;
    if(typeof this.partnerCtrl.value == "string") { 
      this.error = true;
      return; 
    }
    this.dialogRef.close(this.partnerCtrl.value);
  }

  displaySelect(a) {
    return a ? a.name : '';
  }

  _filterStates(data, value: any): any[] {
    if(!value) return [];
    let name = value.name || value;
    return data.filter(cat => (cat.name+"").toLowerCase().indexOf(name.toLowerCase()) > -1);;
  }
}
