import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { concat, Observable, of, Subject } from 'rxjs';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray } from '@angular/forms';
import {map, startWith, first} from 'rxjs/operators';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';
import { MyErrorStateMatcher } from '../../error-state-mather';

import { PlacementForm } from './placement-form';
import { AudienceService } from '../../audiences/audience.service';

import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';

import { ProductsService } from '../../products/products.service';
import { Product } from '../../products/product';
import { ApiAnswer } from '../../api-answer';
import { PlacementsService }  from '../placements.service';
import { InfoService } from '../../info.service';
import { ClickcapComponent } from '../../caps-modal/clickcap-modal/clickcap.component';
import { ImpressioncapComponent } from '../../caps-modal/impressioncap-modal/impressioncap.component';
import { ImpCaps } from '../../caps-modal/impressioncap-modal/impCaps';
import { ClickCaps } from '../../caps-modal/clickcap-modal/clickCaps';
import { PlacementCategoriesModalComponent } from './categories-modal/categories-modal.component';

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

@Component({
  selector: 'app-placement-edit',
  templateUrl: './placement-edit.component.html',
  styleUrls: ['./placement-edit.component.less'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class PlacementEditComponent implements OnInit {

  today = moment(new Date().setHours(0,0,0,0));
  loading = false;
  loadingCities = false;
  loadingCodes = false;
  loadingRegions = false;
  loadingDMA = false;
  loadingDModels = false;
  loadingAud = false;
  loadingPubList = false;
  showDMA = false;
  accid: string;
  campId: string;
  appRef: string;
  pRef: string;
  advId: string;
  apikey: string;
  device_class: string;
  file: File;
  bidTypeValue;
  placement: PlacementForm = new PlacementForm();
  impCaps: ImpCaps = new ImpCaps();
  clickCaps: ClickCaps = new ClickCaps();
  formGroup: FormGroup;
  matcher = new MyErrorStateMatcher();
  goalsData: Observable<any[]>;
  bidTypesData: Observable<any[]>;
  gendersData: Observable<any[]>;
  countriesData: Observable<any[]>;
  regionsData: Observable<any[]>;
  dmasData: Observable<any[]>;
  citiesData: Observable<any[]>;
  pcodesData: Observable<any[]>;
  cityInput = new Subject<string>();
  pcodeInput = new Subject<string>();
  deviceTypesData: Observable<any[]>;
  deviceModelsData: Observable<any[]>;
  conTypesData: Observable<any[]>;
  carriersData: Observable<any[]>;
  osVersionsData: Observable<any[]>;
  exchangesData: Observable<any[]>;
  includeAudData = [];
  excludeAudData = [];
  audData = [];
  bidTypesList = [];
  includePubListData = [];
  excludePubListData = [];
  location_targets = [];
  cats = [
    {'name': 'iOS Appstore Categories', 'value': 'ios appstore', 'enabled': true},
    {'name': 'Android Appstore Categories', 'value': 'android appstore', 'enabled': true},
    {'name': 'Product Categories', 'value': 'google product', 'enabled': true},
    {'name': 'IAB Categories', 'value': 'iab', 'enabled': true}
  ];
  catsObj: Object;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private placementService: PlacementsService,
    private audienceService: AudienceService,
    private location: Location,
    private infoService: InfoService,
    private formBuilder: FormBuilder,
    private productsService: ProductsService,
    public dialog: MatDialog
  ) {
    this.route.queryParams.subscribe(params => {
      this.appRef = params.app_ref;
      this.advId = params.adv_id;
      this.pRef = params.p_ref;
      this.apikey = params.apikey;
      this.device_class = params.device;
    });
  }

  ngOnInit() {
    this.campId = this.route.snapshot.paramMap.get('camp');
    this.accid = this.route.snapshot.paramMap.get('id');
    if(this.device_class.indexOf('android') > -1) {
      this.cats.splice(0, 1);
    }
    if(this.device_class.indexOf('ios') > -1) {
      this.cats.splice(1, 1);
    }
    this.createForm();
    if(!this.accid) {
      this.getDefaultCaps();
    }
    this.getBidTypes();
    this.getPlacement();
    this.getGoals();
    this.getCountries();
    this.getGenders();
    this.getCities();
    this.getPostalCodes();
    this.getDeviceTypes();
    this.getConTypes();
    this.getCarriers();
    this.getOsVersions();
    this.getExchanges();
    this.getAudiences();
    this.getCategories();
    this.getPubLists();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'name': [null, Validators.required],
      'start_date': [{value: this.today, 'disabled': this.loading}, Validators.required],
      'end_date': [{value: this.today, 'disabled': this.loading}, Validators.required],
      'status': ['active', Validators.required],
      'bid_type_id': [null, Validators.required],
      'bid': [null],
      'max_bid_amount': [null],
      'media_fee_percent': [null],
      'client_budget': [null, Validators.required],
      'placement_optimization_goal_id': [null, Validators.required], 
      'placement_optimization_goal_value': [null, Validators.required], 
      'is_pacing_enabled': [false, Validators.required],
      'gender_id': [1, Validators.required],
      'countries': [{'value': [], 'disabled': this.loading}],
      'dmas': [{'value': [], 'disabled': this.loading}],
      'regions': [{'value': [], 'disabled': this.loadingRegions}],
      'cities': [{'value': [], 'disabled': this.loadingCities}],
      'postal_codes': [{'value': [], 'disabled': this.loadingCodes}],
      'location_radius_target': [null, [Validators.min(0), Validators.max(250)]],
      'reward_target': ["all"],
      'carriers': [{'value': [], 'disabled': this.loading}],
      'connection_types': [{'value': [], 'disabled': this.loading}],
      'device_models': [{'value': [], 'disabled': this.loading}],
      'device_types': [{'value': [], 'disabled': this.loading}],
      'os_versions': [{'value': [], 'disabled': this.loading}],
      'traffic_type_target': ['all'],
      'exchanges': [{'value': [], 'disabled': this.loading}],
      'audiences_whitelisted': [{'value': [], 'disabled': this.loading}],
      'audiences_blacklisted': [{'value': [], 'disabled': this.loading}],
      'publisher_lists_whitelisted': [{'value': [], 'disabled': this.loading}],
      'publisher_lists_blacklisted': [{'value': [], 'disabled': this.loading}],
      'categories_whitelisted': [{'value': [], 'disabled': this.loading}],
      'categories_blacklisted': [{'value': [], 'disabled': this.loading}]
    });

    const bid = this.formGroup.get('bid');
    const fee = this.formGroup.get('media_fee_percent');

    this.formGroup.get('bid_type_id').valueChanges
    .subscribe(bidType => {
      this.bidTypeValue = this.bidTypesList.filter(type => type.id == bidType)[0];
      bid.clearValidators();
      fee.clearValidators();
      if(this.bidTypeValue.name == "media") {
        fee.setValidators([Validators.required]);
      } else {
        bid.setValidators([Validators.required]);
      }
      bid.updateValueAndValidity();
      fee.updateValueAndValidity();
    });
  }

  get countries() {
    return this.formGroup.get('countries') as FormControl;
  }

  get location_radius_target() {
    return this.formGroup.get('location_radius_target') as FormControl;
  }

  get dmas() {
    return this.formGroup.get('dmas') as FormControl;
  }

  get regions() {
    return this.formGroup.get('regions') as FormControl;
  }

  get cities() {
    return this.formGroup.get('cities') as FormControl;
  }

  get postal_codes() {
    return this.formGroup.get('postal_codes') as FormControl;
  }

  get bid_type_id() {
    return this.formGroup.get('bid_type_id') as FormControl;
  }

  get device_types() {
    return this.formGroup.get('device_types') as FormControl;
  }

  get device_models() {
    return this.formGroup.get('device_models') as FormControl;
  }

  get start_date() {
    return this.formGroup.get('start_date') as FormControl;
  }

  get end_date() {
    return this.formGroup.get('end_date') as FormControl;
  }

  get audiences_whitelisted() {
    return this.formGroup.get('audiences_whitelisted') as FormControl;
  }

  get audiences_blacklisted() {
    return this.formGroup.get('audiences_blacklisted') as FormControl;
  }

  get categories_whitelisted() {
    return this.formGroup.get('categories_whitelisted') as FormControl;
  }

  get categories_blacklisted() {
    return this.formGroup.get('categories_blacklisted') as FormControl;
  }

  get publisher_lists_whitelisted() {
    return this.formGroup.get('publisher_lists_whitelisted') as FormControl;
  }

  get publisher_lists_blacklisted() {
    return this.formGroup.get('publisher_lists_blacklisted') as FormControl;
  }

  endDatefilter = (d): boolean => {
    return d >= this.start_date.value && d >= this.today;
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

  handleFileInput(e) {
    this.file = e[0];
    var reader = new FileReader();
    let that = this;
    reader.onload = function(event) {
        let result = event['target']['result'].split("\n").map((row) => { 
          let rowsplit = row.split(",");
          if(rowsplit.length == 2) rowsplit = [Number(rowsplit[0]), Number(rowsplit[1])];
          return rowsplit;
        });
        if(result[result.length-1].length < 2) result.pop();
        that.location_targets = result;
    };
    reader.onerror = function(event) {
        console.error("File could not be read! Code " + event['target']['error']['code']);
    };
    reader.readAsText(e[0]);
  }

  disabledInclAud(aud) {
    return this.audiences_whitelisted.value.filter(item => item.audience_configuration_id == aud.audience_configuration_id).length > 0;
  }

  disabledExlAud(aud) {
    return this.audiences_blacklisted.value.filter(item => item.audience_configuration_id == aud.audience_configuration_id).length > 0;
  }

  getAudiences() {
    this.loadingAud = true;
    this.audienceService.getProductAudiences(this.appRef, this.advId)
    .subscribe((data: ApiAnswer) => {
      if(data.data && data.data.length > 0) {
        this.includeAudData = data.data;
        this.excludeAudData = [...this.includeAudData];
        this.setAud();
      }
      this.loadingAud = false;
    });
  }

  disabledInclPubList(list) {
    return this.publisher_lists_whitelisted.value.filter(item => item.public_identifier == list.public_identifier).length > 0;
  }

  disabledExlPubList(list) {
    return this.publisher_lists_blacklisted.value.filter(item => item.public_identifier == list.public_identifier).length > 0;
  }

  getPubLists() {
    this.loadingPubList = true;
    this.infoService.getPubLists(this.pRef)
    .subscribe((data: ApiAnswer) => {
      if(data.data && data.data.length > 0) {
        this.includePubListData = data.data;
        this.excludePubListData = [...this.includePubListData];
        this.setPubList();
      }
      this.loadingPubList = false;
    });
  }

  getCategories() {
    this.infoService.getCategories()
      .subscribe((data: ApiAnswer) => {
        this.catsObj = data.data;
    });
  }

  getBidTypes() {
    this.bidTypesData = this.infoService.getBidTypes().pipe(tap(types => {
      this.bidTypesList = types;
    }));
  }

  getGoals() {
    this.goalsData = this.infoService.getGoals();
  }

  getCountries() {
    this.regions.disable();
    this.countriesData = this.infoService.getCountries();
  }

  getDma() {
    if(this.loadingDMA) return;
    this.loadingDMA = true;
    this.dmas.disable();
    this.dmasData = this.infoService.getDMA(this.countries.value).pipe(
      tap((values)=> { this.showDMA = values.length > 0;this.loadingDMA = false; this.dmas.enable();}));
  }

  getRegions() {
    if(this.loadingRegions) return;
    this.loadingRegions = true;
    this.regions.disable();
    this.regionsData = this.infoService.getRegions(this.countries.value).pipe(
      tap((regions)=> {
        if(this.regions.value.length > 0 && typeof this.regions.value[0] != "object") {
          let selectedRegions = regions.filter(reg => { return this.regions.value.indexOf(reg.id) > -1});
          this.regions.setValue(selectedRegions);
        }
        this.loadingRegions = false; this.regions.enable();
      }));
  }

  getCities() {
    this.cities.disable();
    this.citiesData = concat(
        of([]),
        this.cityInput.pipe(
          filter((term) => term.length >= 2),
            debounceTime(500),
            distinctUntilChanged(),
            tap(() => {this.loadingCities = true; this.cities.disable();}),
            switchMap(term => this.infoService.getCities(this.countries.value, term).pipe(
                catchError(() => of([])),
                tap(() => {this.loadingCities = false; this.cities.enable();})
            ))
        )
    );
  }

  getCitiesById() {
    if(this.loadingCities) return;
    this.cities.disable();
    this.loadingCities = true;
    this.infoService.getCitiesById(this.cities.value).subscribe(
      (cits) => {
        if(this.cities.value.length > 0 && typeof this.cities.value[0] != "object") {
          let selectedCities = cits.filter(cit => { return this.cities.value.indexOf(cit.id) > -1});
          this.cities.setValue(selectedCities);
        }
        this.loadingCities = false; this.cities.enable();
      });
  }

  getPostalCodes() {
    this.postal_codes.disable();
    this.pcodesData = concat(
        of([]),
        this.pcodeInput.pipe(
           filter((term) => term.length >= 2),
            debounceTime(500),
            distinctUntilChanged(),
            tap(() => {this.loadingCodes = true; this.postal_codes.disable();}),
            switchMap(term => this.infoService.getPostalCodes(this.countries.value, term).pipe(
                catchError(() => of([])),
                tap(() => {this.loadingCodes = false; this.postal_codes.enable();})
            ))
        )
    );
  }

  getPostalCodesById() {
    if(this.loadingCodes) return;
    this.postal_codes.disable();
    this.loadingCodes = true;
    this.infoService.getPostalCodesById(this.postal_codes.value).subscribe(
      (codes) => {
        if(this.postal_codes.value.length > 0 && typeof this.postal_codes.value[0] != "object") {
          let selectedCodes = codes.filter(code => { return this.postal_codes.value.indexOf(code.id) > -1});
          this.postal_codes.setValue(selectedCodes);
        }
        this.loadingCodes = false; this.postal_codes.enable();
      });
  }

  getGenders() {
    this.gendersData = this.infoService.getGenders();
  }

  getDeviceTypes() {
    this.device_models.disable();
    this.deviceTypesData = this.infoService.getDeviceTypes();
  }

  getDeviceModels() {
    if(this.loadingDModels) return;
    this.loadingDModels = true;
    this.device_models.disable();
    this.deviceModelsData = this.infoService.getDeviceModels(this.device_types.value, this.pRef).pipe(
      tap((models)=> {
        if(this.device_models.value.length > 0 && typeof this.device_models.value[0] != "object") {
          let selectedModels = models.filter(mod => { return this.device_models.value.indexOf(mod.id) > -1});
          this.device_models.setValue(selectedModels);
        }
        this.loadingDModels = false; this.device_models.enable();
      }));
  }
  getConTypes() {
    this.conTypesData = this.infoService.getConnectionTypes();
  }
  getCarriers() {
    this.carriersData = this.infoService.getCarriers();
  }
  getOsVersions() {
    this.osVersionsData = this.infoService.getOsVersions(this.pRef);
  }
  getExchanges() {
    this.exchangesData = this.infoService.getExchangesByProduct(this.pRef);
  }

  countryChange() {
    if(this.countries.value.length > 0) {
      this.postal_codes.enable();
      this.getDma();
      this.getRegions();
      this.cities.enable();
    } else {
      this.cities.setValue([]); this.cities.disable();
      this.postal_codes.disable(); this.postal_codes.setValue([]);
      this.regions.disable(); this.regions.setValue([]);
    }
  }

  removeCountry() {
    this.regions.setValue(this.regions.value.filter((item) => this.countries.value.indexOf(item.country_id) > -1));
    this.cities.setValue(this.cities.value.filter((item) => this.countries.value.indexOf(item.country_id) > -1));
    this.postal_codes.setValue(this.postal_codes.value.filter((item) => this.countries.value.indexOf(item.country_id) > -1));
    this.dmas.setValue(this.dmas.value.filter((item) => this.countries.value.indexOf(item.country_id) > -1));
  }

  deviceTypeChange() {
    if(this.device_types.value.length > 0) {
      this.device_models.enable();
      this.getDeviceModels();
    } else {
      this.device_models.disable(); this.device_models.setValue([]);
    }
  }

  removeDeviceType() {
    this.device_models.setValue(this.device_models.value.filter((item) => this.device_types.value.indexOf(item.device_type_id) > -1));
  }

  openCategories(cat) {
    var cats = this.catsObj[cat.value];
    const dialogRef = this.dialog.open(PlacementCategoriesModalComponent, {
      width: '500px',
      data: {
        'cats': cats, 
        'includedCats': this.placement.categories_whitelisted,
        'excludedCats': this.placement.categories_blacklisted,
        'name': cat.name}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.placement.categories_whitelisted = result.included;
        this.placement.categories_blacklisted = result.excluded;
        this.categories_whitelisted.setValue(this.placement.categories_whitelisted);
        this.categories_blacklisted.setValue(this.placement.categories_blacklisted);
      }
    });
  }

  getPlacement() {
    if(!this.accid) {
      this.formGroup.patchValue(this.placement);
      return;
    }
    this.loading = true;
    this.placementService.getPlacement(this.accid)
      .subscribe((data: ApiAnswer) => {
        this.placement = data.data;
        this.formGroup.patchValue(this.placement);
        this.setCaps(this.placement);
        this.start_date.setValue(moment(data.data.start_date));
        this.end_date.setValue(moment(data.data.end_date));
        this.dateChange();
        this.countryChange();
        this.deviceTypeChange();
        this.setAud();
        this.setPubList();
        this.location_targets = data.data.location_targets;
        if(this.cities.value.length > 0) this.getCitiesById();
        if(this.postal_codes.value.length > 0) this.getPostalCodesById();
        this.loading = false;
      });
  }

  getDefaultCaps() {
    this.loading = true;
    this.placementService.getDefaultCaps()
    .subscribe((data: ApiAnswer) => {
        this.loading = false;
        this.setCaps(data.data);
      });
  }

  setAud() {
    if(this.includeAudData.length > 0 && this.placement.audiences_whitelisted && this.placement.audiences_whitelisted.length > 0) this.audiences_whitelisted.setValue(this.includeAudData.filter(item => this.placement.audiences_whitelisted.indexOf(item.audience_configuration_id) > -1));
    if(this.excludeAudData.length > 0 && this.placement.audiences_blacklisted && this.placement.audiences_blacklisted.length > 0)this.audiences_blacklisted.setValue(this.excludeAudData.filter(item => this.placement.audiences_blacklisted.indexOf(item.audience_configuration_id) > -1));
  }

  setPubList() {
    if(this.includePubListData.length > 0 && this.placement.publisher_lists_whitelisted && this.placement.publisher_lists_whitelisted.length > 0) this.publisher_lists_whitelisted.setValue(this.includePubListData.filter(item => this.placement.publisher_lists_whitelisted.indexOf(item.public_identifier) > -1));
    if(this.excludePubListData.length > 0 && this.placement.publisher_lists_blacklisted && this.placement.publisher_lists_blacklisted.length > 0)this.publisher_lists_blacklisted.setValue(this.excludePubListData.filter(item => this.placement.publisher_lists_blacklisted.indexOf(item.public_identifier) > -1));
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

  redirect() {
    this.router.navigate(['/placements'], {queryParams: {apikey: this.apikey}});
  }

  onSubmit(form: FormGroup) {
    if(form.invalid || this.loading) return;
    this.loading = true;
    let formData: PlacementForm = Object.assign({}, form.value);
    Object.assign(formData, this.impCaps, this.clickCaps);
    formData.countries = formData.countries || [];
    formData.regions = formData.regions ? formData.regions.map(function(item) {return item["id"];}) : [];
    formData.dmas = formData.dmas ? formData.dmas.map(function(item) {return item["id"];}): [];
    formData.cities = formData.cities ? formData.cities.map(function(item) {return item["id"];}) : [];
    formData.postal_codes = formData.postal_codes ? formData.postal_codes.map(function(item) {return item["id"];}) : [];
    formData.device_models = formData.device_models ? formData.device_models.map(function(item) {return item["id"];}) : [];
    formData.audiences_blacklisted = formData.audiences_blacklisted ? formData.audiences_blacklisted.map(function(item) {return item["audience_configuration_id"];}) : [];
    formData.audiences_whitelisted = formData.audiences_whitelisted ? formData.audiences_whitelisted.map(function(item) {return item["audience_configuration_id"];}) : [];
    formData.publisher_lists_blacklisted = formData.publisher_lists_blacklisted ? formData.publisher_lists_blacklisted.map(function(item) {return item["public_identifier"];}) : [];
    formData.publisher_lists_whitelisted = formData.publisher_lists_whitelisted ? formData.publisher_lists_whitelisted.map(function(item) {return item["public_identifier"];}) : [];
    formData.start_date = this.start_date.value.format(MY_FORMATS.parse.dateInput);
    formData.end_date = this.end_date.value.format(MY_FORMATS.parse.dateInput);
    formData.location_targets = this.location_targets;
    if(this.accid) {
      formData.public_identifier = this.accid;
      this.placementService.updatePlacement(formData)
        .subscribe((data: ApiAnswer) => {
          this.loading = false;
          if(data.success) this.router.navigate(['/placements'], {queryParams: {apikey: this.apikey}});
        });
      } else {
        formData.campaign_public_identifier = this.campId;
        this.placementService.createPlacement(formData)
        .subscribe((data: ApiAnswer) => {
          this.loading = false;
          if(data.success) this.router.navigate(['/placements'], {queryParams: {apikey: this.apikey}});
        });
      }
  }

}
