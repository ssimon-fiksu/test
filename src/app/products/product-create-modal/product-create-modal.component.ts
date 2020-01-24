import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith, tap} from 'rxjs/operators';
import { MyErrorStateMatcher } from '../../error-state-mather';
import { ApiAnswer } from '../../api-answer';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from '../../auth/auth.service';
import { ProductsService } from '../products.service';
import { InfoService } from '../../info.service';

import { ProductForm } from '../productForm';

const regURL = 'https?://([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-\?\-%$&+,:;=?@#|\'<>.^*()%!-]*/?';

@Component({
  selector: 'app-product-create-modal',
  templateUrl: './product-create-modal.component.html',
  styleUrls: ['./product-create-modal.component.less']
})
export class ProductCreateModalComponent implements OnInit {

  inStoreformGroup: FormGroup;
  inDevformGroup: FormGroup;
  brandFormGroup: FormGroup;
  loading = false;
  matcher = new MyErrorStateMatcher();
  iosCategories: Observable<any[]>;
  iosCategoriesData: any[] = [];
  androidCategories: Observable<any[]>;
  androidCategoriesData: any[] = [];
  countries: Observable<any[]>;
  countriesData: Observable<any[]>;
  mode = 'inStore';
  platfrom = 'ios';
  type = 'app';

  constructor(private permissionsService: NgxPermissionsService,
    private authService: AuthService,
    private productsService: ProductsService,
    private infoService: InfoService,
    public dialogRef: MatDialogRef<ProductCreateModalComponent>, 
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.permissionsService.loadPermissions(this.authService.userRoles);
    if(this.permissionsService.getPermission('application creator development')) {
      this.getCategories();
      this.getCountries();
      this.createinDevformGroup();
    }
    this.createInStoreformGroup();
    this.createBrandFormGroup();
  }

  get storeurl() {
    return this.inStoreformGroup.get('storeurl') as FormControl;
  }

  get productname() {
    return this.inDevformGroup.get('productname') as FormControl;
  }

  get bundle() {
    return this.inDevformGroup.get('bundle') as FormControl;
  }

  get productId() {
    return this.inDevformGroup.get('productId') as FormControl;
  }

  get region() {
    return this.inDevformGroup.get('region') as FormControl;
  }

  get category() {
    return this.inDevformGroup.get('category') as FormControl;
  }

  get brandname() {
    return this.brandFormGroup.get('brandname') as FormControl;
  }

  displaySelect(a) {
    return a ? a.name : '';
  }

  _filterStates(data, value: any): any[] {
    if(!value) return [];
    let name = value.name || value;
    return data.filter(cat => (cat.name+"").toLowerCase().indexOf(name.toLowerCase()) > -1);
  }

  createInStoreformGroup() {
    this.inStoreformGroup = this.formBuilder.group({
      'storeurl': [null, [Validators.pattern(regURL), Validators.required]]
    });
  }

  createBrandFormGroup() {
    this.brandFormGroup = this.formBuilder.group({
      'brandname': [null, Validators.required]
    });
  }

  createinDevformGroup() {
    this.inDevformGroup = this.formBuilder.group({
      'productname': [null, Validators.required],
      'bundle': [null],
      'productId': [null, Validators.required],
      'region': [null],
      'category': [null, Validators.required]
    });
  }

  getCategories() {
    this.productsService.getCategories()
      .subscribe((data: ApiAnswer) => {
        this.iosCategoriesData = data.data.ios_categories || [];
        this.androidCategoriesData = data.data.android_categories || [];
        this.iosCategories = this.category.valueChanges
        .pipe(
          startWith(null),
          map(cat => cat ? this._filterStates(this.iosCategoriesData, cat) : this.iosCategoriesData.slice())
        );
        this.androidCategories = this.category.valueChanges
        .pipe(
          startWith(null),
          map(cat => cat ? this._filterStates(this.androidCategoriesData, cat) : this.androidCategoriesData.slice())
        );
    });
  }

  getCountries() {
    this.countries = this.infoService.getCountries()
    .pipe(
      tap((data) => {
        this.countries = this.region.valueChanges
          .pipe(
            startWith(null),
            map(country => country ? this._filterStates(data, country) : data.slice())
          );
      }));
  }

  confirmBrand() {
    if(this.loading) return;
    this.loading = true;
    let productForm = new ProductForm();
    productForm.application_name = this.brandname.value;
    productForm.device_class = 'mobile_web';
    productForm.category_names = [null];
    productForm.external_category_identifiers = [null];
    productForm.advertiser_public_identifier = this.data.advId;
    this.productsService.createProduct(productForm)
     .subscribe((data: ApiAnswer) => {
        this.loading = false;
        if(data.success) {
          this.dialogRef.close({"brand": true});
        }
    });
  }

  confirmIndev() {
    if(this.platfrom == "android") {
      this.bundle.setValue("dummy");
      this.region.setValue({country_code:"US"});
    }
    if(this.inDevformGroup.status == "INVALID") {
      return;
    }
    let productForm = new ProductForm();
    productForm.application_name = this.productname.value;
    productForm.device_class = this.platfrom;
    productForm.bundle_id = this.platfrom == "android" ? '': this.bundle.value;
    productForm.appstore_country_code = this.region.value.country_code;
    productForm.category_name = this.category.value.name;
    productForm.external_category_identifier = this.category.value.external_category_identifier;
    productForm.category_names = [productForm.category_name];
    productForm.external_category_identifiers = [productForm.external_category_identifier];
    productForm.external_application_identifier = this.productId.value;
    this.dialogRef.close(productForm);
  }

  confirmInstore() {
    this.loading = true;
    this.productsService.lookup(this.storeurl.value)
     .subscribe((data: ApiAnswer) => {
        this.loading = false;
        if(data.success) {
          this.dialogRef.close(data.data);
        }
    });
  }

}
