import { Component, Inject, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { AudienceService } from '../audience.service';
import { ApiAnswer } from '../../api-answer';
import { AudienceForm } from './audienceForm';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.less']
})
export class EditAudienceComponent implements  OnInit {

  loading: boolean = false;
  sizes = [];
  toSave: AudienceForm = new AudienceForm();

  constructor(public dialogRef: MatDialogRef<EditAudienceComponent>, 
    @Inject(MAT_DIALOG_DATA) public data,
    private audienceService: AudienceService) {
    this.toSave.app_ref = data.product.app_ref;
    if(data.aud) {
      this.nameFormControl.setValue(data.aud.external_info.name);
      this.toSave.id = data.aud.audience_configuration_id;
      this.getAudLookalike();
    } else {
      this.toSave.device_type = data.product.device_class;
      this.toSave.client_ref = data.client.client_api_ref;
      this.toSave.advertiser_public_identifier = data.adv.public_identifier;
    }
  }

  nameFormControl = new FormControl('', [
    Validators.required
  ]);

  ngOnInit() {
    this.audienceService.getLookalikeSizes()
      .subscribe((data: ApiAnswer) => {
       this.sizes = data.data;
    });
  }

  getAudLookalike() {
    this.loading = true;
    this.audienceService.getAudienceLookalike(this.toSave.app_ref, this.toSave.id)
    .subscribe((data: ApiAnswer) => {
      this.loading = false;
      this.toSave.create_fiksu_lookalike = data.data.fiksu_lookalike_exists;
      this.toSave.lookalike_size_id = data.data.fiksu_lookalike_size_id || this.toSave.lookalike_size_id; 
    });
  }

  updateAud() {
    if(this.loading) return;
    this.loading = true;
    this.toSave.audience_name = this.nameFormControl.value + "";
    this.audienceService.updateAudience(this.toSave)
    .subscribe((data: ApiAnswer) => {
      this.loading = false;
      if(data.success) {
        this.dialogRef.close(data.data);
      }      
    });
  }

  createAud(upload) {
    if(this.loading) return;
    this.loading = true;
    this.toSave.audience_name = this.nameFormControl.value + "";
    this.audienceService.createAudience(this.toSave)
    .subscribe((data: ApiAnswer) => {
      this.loading = false;
      if(data.success) {
        this.dialogRef.close({upload: upload, aud: data.data});
      }      
    });
  }

}
