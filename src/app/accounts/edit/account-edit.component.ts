import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {Observable} from 'rxjs';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray } from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { MyErrorStateMatcher } from '../../error-state-mather';

import { AccountForm } from './account-form';
import { App } from './app';

import { ApiAnswer } from '../../api-answer';
import { CategoriesPopupComponent } from '../../categories-popup/categories-popup.component';
import { AccountService }  from '../account.service';
import { InfoService } from '../../info.service';

function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
}

const regURL = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-\?\-%$&+,:;=?@#|\'<>.^*()%!-]*/?';
const imgPXL = `<img src ?= ?"${regURL}" ?/?>`;

@Component({
  selector: 'app-account-edit',
  templateUrl: './account-edit.component.html',
  styleUrls: ['./account-edit.component.less']
})
export class AccountEditComponent implements OnInit {

  loading = false;
  accid: string;
  account: AccountForm = new AccountForm();
  apps: Observable<App[]>;
  appsData: App[] = [];
  formGroup: FormGroup;
  matcher = new MyErrorStateMatcher();
  cats = [
    {'name': 'Appstore Categories', 'value': 'appstore'}, 
    {'name': 'Sensitive Categories', 'value': 'google sensitive'},
    {'name': 'Product Categories', 'value': 'google product'},
    {'name': 'IAB Categories', 'value': 'iab'}
  ];
  catsObj: Object;
  exchanges: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private infoService: InfoService,
    private location: Location,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.accid = this.route.snapshot.paramMap.get('id');
    this.createForm();
    this.getAccount();
    this.getApps();
    this.getCategories();
    this.getExchanges();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'fiksu_app': [{value: null, disabled: this.accid}, Validators.required],
      'account_name': [null, Validators.required],
      'adomain': [null, Validators.required],
      'min_allowed_age': [0, [Validators.required, Validators.max(127)]],
      'is_pacing_enabled': [false, Validators.required],
      'exploration_bid_percentage': [0, Validators.required],
      'exchange_ids': [],
      'category_ids': [],
      'advertiser': '',
      'third_party_impression_markup': ['', Validators.pattern(imgPXL)],
      'impression_beacon': ['', Validators.pattern(regURL)]
    });
  }

  get account_name() {
    return this.formGroup.get('account_name') as FormControl;
  }

  get fiksu_app() {
    return this.formGroup.get('fiksu_app') as FormControl;
  }

  get min_allowed_age() {
    return this.formGroup.get('min_allowed_age') as FormControl;
  }

  get exploration_bid_percentage() {
    return this.formGroup.get('exploration_bid_percentage') as FormControl;
  }

  get impression_beacon() {
    return this.formGroup.get('impression_beacon') as FormControl;
  }

  get exchange_ids() {
    return this.formGroup.get('exchange_ids') as FormControl;
  }

  get adomain() {
    return this.formGroup.get('adomain') as FormControl;
  }

  get category_ids() {
    return this.formGroup.get('category_ids') as FormControl;
  }

  get third_party_impression_markup() {
    return this.formGroup.get('third_party_impression_markup') as FormControl;
  }

  openCategories(cat) {
    var cats = this.catsObj[cat.value];
    if(cat.value == 'appstore') {
      cats = this.catsObj[`${this.fiksu_app.value.device_class} appstore`];
    }
    const dialogRef = this.dialog.open(CategoriesPopupComponent, {
      width: '500px',
      data: {cats: cats, selectedCats: this.account.category_ids, name: cat.name}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.account.category_ids = result;
        this.category_ids.setValue(this.account.category_ids);
      }
    });
  }

  _filterStates(value: any): App[] {
    if(!value) return [];
    let name = value.application_name || value;
    return this.appsData.filter(app => (app.application_name+"").toLowerCase().indexOf(name.toLowerCase()) > -1);
  }

  selectAll(select) {
    select.update.emit(this.exchanges); 
  }

  deselectAll(select) {
    select.update.emit([]); 
  }

  displayApp(a: App) {
    return a ? a.application_name : '';
  }

  getApps() {
    this.accountService.getApps()
      .subscribe((data: ApiAnswer) => {
        this.appsData = data.data || [];
        this.apps = this.fiksu_app.valueChanges
        .pipe(
          startWith(null),
          map(app => app ? this._filterStates(app) : this.appsData.slice())
        );
        if(this.account.fiksu_app_id) {
          this.fiksu_app.setValue(this.appsData.filter(app => app.id == this.account.fiksu_app_id)[0])
        }
    });
  }

  getCategories() {
    this.infoService.getCategories(true)
      .subscribe((data: ApiAnswer) => {
        this.catsObj = data.data;
    });
  }

  getExchanges() {
    this.infoService.getExchanges()
      .subscribe((data: ApiAnswer) => {
        if(data.data && data.data.length > 0) {
          this.exchanges = data.data;
        }
    });
  }

  getAccount() {
    if(!this.accid) {
      this.formGroup.patchValue(this.account);
      return;
    }
    this.loading = true;
    this.accountService.getAccount(this.accid)
      .subscribe((data: ApiAnswer) => {
        this.account = data.data;
        if(this.appsData.length > 0) this.fiksu_app.setValue(this.appsData.filter(app => app.id == this.account.fiksu_app_id)[0]);
        this.formGroup.patchValue(this.account);
        this.loading = false;
      });
  }

  onSubmit(form: FormGroup) {
    if(form.invalid || this.loading) return;
    this.loading = true;
    if(this.accid) {
      this.accountService.updateAccount(form.value, this.accid)
        .subscribe((data: ApiAnswer) => {
          this.loading = false;
          if(data.success) this.router.navigate(['/accounts'], {queryParamsHandling: "preserve"});
        });
      } else {
        form.value.fiksu_app_id = form.value.fiksu_app.id;
        form.value.device_class_id = form.value.fiksu_app.device_class_id;
        this.accountService.createAccount(form.value)
        .subscribe((data: ApiAnswer) => {
          this.loading = false;
          if(data.success) this.router.navigate(['/accounts'], {queryParamsHandling: "preserve"});
        });
      }
  }
}
