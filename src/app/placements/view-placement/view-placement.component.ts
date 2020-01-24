import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { concat, Observable, of, Subject } from 'rxjs';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators, FormArray } from '@angular/forms';
import {map, startWith, first} from 'rxjs/operators';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';
import { MyErrorStateMatcher } from '../../error-state-mather';

import { PlacementForm } from '../edit/placement-form';
import { AudienceService } from '../../audiences/audience.service';

import { ProductsService } from '../../products/products.service';
import { Product } from '../../products/product';
import { ApiAnswer } from '../../api-answer';
import { PlacementsService }  from '../placements.service';
import { InfoService } from '../../info.service';

@Component({
  selector: 'app-view-placement',
  templateUrl: './view-placement.component.html',
  styleUrls: ['./view-placement.component.less']
})
export class ViewPlacementComponent implements OnInit {

  loading = false;
  showDMA = false;
  accid: string;
  appRef: string;
  pRef: string;
  advId: string;
  apikey: string;
  device_class: string;
  bidTypeValue;
  placement: PlacementForm = new PlacementForm();
  formGroup: FormGroup;
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
    this.accid = this.route.snapshot.paramMap.get('id');
    this.createForm();
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
    this.getPubLists();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'name': [null],
      'start_date': [null],
      'end_date': [null],
      'status': [{'value': null, 'disabled': true}],
      'bid_type_id': [{'value': null, 'disabled': true}],
      'bid': [null],
      'max_bid_amount': [null],
      'media_fee_percent': [null],
      'client_budget': [null],
      'placement_optimization_goal_id': [{'value': null, 'disabled': true}], 
      'placement_optimization_goal_value': [null], 
      'is_pacing_enabled': [{'value': false, 'disabled': true}],
      'gender_id': [{'value': 1, 'disabled': true}],
      'countries': [{'value': [], 'disabled': true}],
      'dmas': [{'value': [], 'disabled': true}],
      'regions': [{'value': [], 'disabled': true}],
      'cities': [{'value': [], 'disabled': true}],
      'postal_codes': [{'value': [], 'disabled': true}],
      'location_radius_target': [null],
      'reward_target': [{'value': 'all', 'disabled': true}],
      'carriers': [{'value': [], 'disabled': true}],
      'connection_types': [{'value': [], 'disabled': true}],
      'device_models': [{'value': [], 'disabled': true}],
      'device_types': [{'value': [], 'disabled': true}],
      'os_versions': [{'value': [], 'disabled': true}],
      'traffic_type_target': [{'value': 'all', 'disabled': true}],
      'exchanges': [{'value': [], 'disabled': true}],
      'audiences_whitelisted': [{'value': [], 'disabled': true}],
      'audiences_blacklisted': [{'value': [], 'disabled': true}],
      'publisher_lists_whitelisted': [{'value': [], 'disabled': true}],
      'publisher_lists_blacklisted': [{'value': [], 'disabled': true}],
      'categories_whitelisted': [{'value': [], 'disabled': true}],
      'categories_blacklisted': [{'value': [], 'disabled': true}],
      'click_cap_daily': [null],
      'click_cap_monthly': [null],
      'impression_cap_daily': [null],
      'impression_cap_hourly': [null],
      'impression_cap_monthly': [null]
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


  getAudiences() {
    this.audienceService.getProductAudiences(this.appRef, this.advId)
    .subscribe((data: ApiAnswer) => {
      if(data.data && data.data.length > 0) {
        this.includeAudData = data.data;
        this.excludeAudData = [...this.includeAudData];
        this.setAud();
      }
    });
  }

  getPubLists() {
    this.infoService.getPubLists(this.pRef)
    .subscribe((data: ApiAnswer) => {
      if(data.data && data.data.length > 0) {
        this.includePubListData = data.data;
        this.excludePubListData = [...this.includePubListData];
        this.setPubList();
      }
    });
  }


  getBidTypes() {
    this.bidTypesData = this.infoService.getBidTypes().pipe(tap(types => {
      this.bidTypesList = types;
      if(this.bid_type_id.value) this.bidTypeValue = this.bidTypesList.filter(type => type.id == this.bid_type_id.value)[0];
    }));
  }

  getGoals() {
    this.goalsData = this.infoService.getGoals();
  }

  getCountries() {
    this.countriesData = this.infoService.getCountries();
  }

  getDma() {
    this.dmasData = this.infoService.getDMA(this.countries.value).pipe(
      tap((values)=> { this.showDMA = values.length > 0;}));
  }

  getRegions() {
    this.regionsData = this.infoService.getRegions(this.countries.value).pipe(
      tap((regions)=> {
        if(this.regions.value.length > 0 && typeof this.regions.value[0] != "object") {
          let selectedRegions = regions.filter(reg => { return this.regions.value.indexOf(reg.id) > -1});
          this.regions.setValue(selectedRegions);
        }
      }));
  }

  getCities() {
    this.citiesData = concat(
        of([]),
        this.cityInput.pipe(
          filter((term) => term.length >= 2),
            debounceTime(500),
            distinctUntilChanged(),
            switchMap(term => this.infoService.getCities(this.countries.value, term).pipe(
                catchError(() => of([])),
            ))
        )
    );
  }

  getCitiesById() {
    this.infoService.getCitiesById(this.cities.value).subscribe(
      (cits) => {
        if(this.cities.value.length > 0 && typeof this.cities.value[0] != "object") {
          let selectedCities = cits.filter(cit => { return this.cities.value.indexOf(cit.id) > -1});
          this.cities.setValue(selectedCities);
        }
      });
  }

  getPostalCodes() {
    this.pcodesData = concat(
        of([]),
        this.pcodeInput.pipe(
           filter((term) => term.length >= 2),
            debounceTime(500),
            distinctUntilChanged(),
            switchMap(term => this.infoService.getPostalCodes(this.countries.value, term).pipe(
                catchError(() => of([])),
            ))
        )
    );
  }

  getPostalCodesById() {
    this.infoService.getPostalCodesById(this.postal_codes.value).subscribe(
      (codes) => {
        if(this.postal_codes.value.length > 0 && typeof this.postal_codes.value[0] != "object") {
          let selectedCodes = codes.filter(code => { return this.postal_codes.value.indexOf(code.id) > -1});
          this.postal_codes.setValue(selectedCodes);
        }
      });
  }

  getGenders() {
    this.gendersData = this.infoService.getGenders();
  }

  getDeviceTypes() {
    this.deviceTypesData = this.infoService.getDeviceTypes();
  }

  getDeviceModels() {
    this.deviceModelsData = this.infoService.getDeviceModels(this.device_types.value, this.pRef).pipe(
      tap((models)=> {
        if(this.device_models.value.length > 0 && typeof this.device_models.value[0] != "object") {
          let selectedModels = models.filter(mod => { return this.device_models.value.indexOf(mod.id) > -1});
          this.device_models.setValue(selectedModels);
        }
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
      this.getDma();
      this.getRegions();
    } else {
      this.cities.setValue([]);
      this.postal_codes.setValue([]);
      this.regions.setValue([]);
    }
  }

  deviceTypeChange() {
    if(this.device_types.value.length > 0) {
      this.getDeviceModels();
    } else {
      this.device_models.setValue([]);
    }
  }

  getPlacement() {
    this.loading = true;
    this.placementService.getPlacement(this.accid)
      .subscribe((data: ApiAnswer) => {
        this.placement = data.data;
        this.formGroup.patchValue(this.placement);
        this.countryChange();
        this.deviceTypeChange();
        this.setAud();
        this.setPubList();
        this.location_targets = data.data.location_targets;
        if(this.cities.value.length > 0) this.getCitiesById();
        if(this.postal_codes.value.length > 0) this.getPostalCodesById();
        if(this.bidTypesList.length > 0) this.bidTypeValue = this.bidTypesList.filter(type => type.id == this.bid_type_id.value)[0];
        this.loading = false;
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

  redirect() {
    this.router.navigate(['/placements'], {queryParams: {apikey: this.apikey}});
  }

}
