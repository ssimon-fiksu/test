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
import { PartnersModalComponent } from './partners-modal/partners-modal.component';
import { CategoriesPopupComponent } from '../../categories-popup/categories-popup.component';

const regURL = 'https?://([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-\?\-%$&+,:;=?@#|\'<>.^*()%!-\{\}]*/?';

@Component({
  selector: 'app-product-config-modal',
  templateUrl: './product-config-modal.component.html',
  styleUrls: ['./product-config-modal.component.less']
})
export class ProductConfigModalComponent implements OnInit {

  formGroup: FormGroup;
  loading = false;
  matcher = new MyErrorStateMatcher();
  macroses: Array<string>;
  partners: any[];
  selectedPartnId;
  selectedPartner;
  device_class;
  selectedCatIds: string[];
  cats = [
    {'name': 'iOS Appstore Categories', 'value': 'ios appstore', 'enabled': true},
    {'name': 'Android Appstore Categories', 'value': 'android appstore', 'enabled': true},
    {'name': 'Sensitive Categories', 'value': 'google sensitive', 'enabled': true},
    {'name': 'Product Categories', 'value': 'google product', 'enabled': true},
    {'name': 'IAB Categories', 'value': 'iab', 'enabled': true}
  ];
  catsObj: Object;

  constructor(public dialogRef: MatDialogRef<ProductConfigModalComponent>, 
    @Inject(MAT_DIALOG_DATA) public data,
    private productsService: ProductsService,
    private trackingService: TrackingService,
    public dialog: MatDialog,
    private infoService: InfoService,
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    if(this.data.type.indexOf('android') > -1) {
      this.cats.splice(0, 1);
    }
    if(this.data.type.indexOf('ios') > -1) {
      this.cats.splice(1, 1);
    }
    this.getMacroses();
    this.getPartners();
    this.createForm();
    this.getLinks();
    this.getCategories();
  }

  get impression_url() {
    return this.formGroup.get('impression_url') as FormControl;
  }

  get click_url() {
    return this.formGroup.get('click_url') as FormControl;
  }

  get min_allowed_age() {
    return this.formGroup.get('min_allowed_age') as FormControl;
  }

  get tracking_partner_id() {
    return this.formGroup.get('tracking_partner_id') as FormControl;
  }

  get category_ids() {
    return this.formGroup.get('category_ids') as FormControl;
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'impression_url': [null, Validators.pattern(regURL)],
      'click_url': [null],
      'is_async_click': [false],
      'min_allowed_age': [null, Validators.required],
      'tracking_partner_id': [null],
      'category_ids': []
    });
    if(this.data.type != "brand") {
      this.click_url.setValidators([Validators.required, Validators.pattern(regURL)]);
      this.click_url.updateValueAndValidity();
    }
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

  partnerModalOpen() {
    const dialogRef = this.dialog.open(PartnersModalComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {'partners': this.partners, 'selected': this.selectedPartner, 'clientRef': this.data.clientRef}
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data) {
        this.selectedPartner = data;
        this.tracking_partner_id.setValue(this.selectedPartner.id);
      }
    });
  }

  getMacroses() {
    this.productsService.getMacroses()
     .subscribe((data: ApiAnswer) => {
        this.macroses = data.data;
    });
  }

  clickChip(mac) {
    this.click_url.setValue(this.click_url.value + mac);
  }

  openCategories(cat) {
    var cats = this.catsObj[cat.value];
    const dialogRef = this.dialog.open(CategoriesPopupComponent, {
      width: '500px',
      data: {'cats': cats, 'selectedCats': this.selectedCatIds, 'name': cat.name}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.selectedCatIds = result;
        this.category_ids.setValue(this.selectedCatIds);
      }
    });
  }

  getCategories() {
    this.infoService.getCategories()
      .subscribe((data: ApiAnswer) => {
        this.catsObj = data.data;
    });
  }

  save() {
    if(this.formGroup.invalid) return;
    this.loading = true;
    let urls = this.formGroup.value;
    urls.advertiser_public_identifier = this.data.advRef;
    urls.iphone_application_public_identifier = this.data.appRef;
    this.productsService.updateUrls(urls)
     .subscribe((data: ApiAnswer) => {
        this.loading = false;
        if(data.success) {
          this.dialogRef.close(data.success);
        }
    });
  }

}
