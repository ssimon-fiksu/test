import { Component, OnInit, ViewChild, ViewEncapsulation,ElementRef, QueryList, ViewChildren} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignPerformance } from './campaign-performance';
import { ApiAnswer } from '../api-answer';
import { MatSort, MatTableDataSource, MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import * as moment from 'moment';
import {FormControl, Validators} from '@angular/forms';

import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from '../auth/auth.service';

import { CampaignPerformanceService } from './campaign-performance.service';
import { AccountService } from '../accounts/account.service';
import { environment } from '../../environments/environment';
import { NgxDrpOptions, PresetItem, Range } from 'ngx-mat-daterange-picker';
import { AccountInfo } from './account-info';
import { PubliherTargetingComponent } from './publiher-targeting/publiher-targeting.component';
import { DatetimeTargetingComponent } from './datetime-targeting/datetime-targeting.component';
import { AudienceTargetingComponent } from './audience-targeting/audience-targeting.component';
import { CampaignInfoComponent } from './campaign-info/campaign-info.component';
import { CampaignsService } from '../campaigns/campaigns.service';

@Component({
  selector: 'app-campaigns-performance',
  templateUrl: './campaigns-performance.component.html',
  styleUrls: ['./campaigns-performance.component.less']
})
export class CampaignPerformanceComponent implements OnInit {

  updateStatusLoading = false;
  updateNumbers = false;
  updatePacingStatus = false;
  nameFilter: string;
  accid: string;
  dateFilterChecked = false;
  campaignPerformance: CampaignPerformance[];
  active = 'true';
  dateRange = {startDate: moment, endDate: moment};
  dataSource = new MatTableDataSource<CampaignPerformance>();
  loading = false;
  accInfo: AccountInfo = new AccountInfo();
  displayedColumns: string[] = [
  "external_id", "campaign_name", "is_active", "adx_creatives",  "creative", "client_budget", "is_pacing_enabled",
  "reward_target", "target", "ads_auction_metrics", "first_impression_at", "impressions", "clicks", "conversions", "cr", 
  "ctr", "client_spend", "media_spend", "exp_spend", "opt_spend", "cpm", "cpc", "cpi", "profit", "margin"];

  range: Range = {fromDate:new Date(), toDate: new Date()};
  options:NgxDrpOptions;
  presets:Array<PresetItem> = [];
  
  constructor(
    private campaignPerformanceService: CampaignPerformanceService,
    private campaignService: CampaignsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private accService: AccountService,
    public dialog: MatDialog,
    private permissionsService: NgxPermissionsService,
    private authService: AuthService) { }

  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChildren('editableInput') editableInput:QueryList<ElementRef>;

  fundsFormControl = new FormControl('', [
    Validators.required, Validators.min(0)
  ]);

  ageFormControl = new FormControl('', [
    Validators.required, Validators.min(0), Validators.max(127)
  ]);

  clientBFormControl = new FormControl('', [
    Validators.required, Validators.min(0)
  ]);

  optBFormControl = new FormControl('', [
    Validators.required, Validators.min(0)
  ]);

  expBFormControl = new FormControl('', [
    Validators.required, Validators.min(0)
  ]);

  ngOnInit() {
    this.permissionsService.loadPermissions(this.authService.userRoles);
    this.dateRangeInit();
    this.accid = this.route.snapshot.paramMap.get('accid');
    if(this.accid) {
      this.getCampaignPerformances();
      if(this.permissionsService.getPermission('account viewer')) {
        this.getAccInfo();
      }
    }
    else {
      this.snackBar.openFromComponent(CampaignPerformanceComponent, {
        data: "Account id is missing"
      });
    }
  }

  getAccInfo() {
    this.accService.getAccInfo(this.accid)
      .subscribe((data: ApiAnswer) => {
        this.accInfo = data.data;
        this.fundsFormControl.setValue(this.accInfo.dollars_remaining);
        this.ageFormControl.setValue(this.accInfo.min_allowed_age);
        this.clientBFormControl.setValue(this.accInfo.daily_client_budget_dollars);
        this.optBFormControl.setValue(this.accInfo.daily_budget_dollars);
        this.expBFormControl.setValue(this.accInfo.daily_budget_exploration_dollars);
      });
  }

  updateStatus(camp: CampaignPerformance) {
    this.updateStatusLoading = true;
    this.campaignService.updateStatus(camp.external_id, !camp.is_active)
    .subscribe((data: ApiAnswer) => {
        camp.is_active = !camp.is_active;
        this.updateStatusLoading = false;
      });
  }

  dateRangeInit() {
    const today = new Date();
 
    this.setupPresets();
    this.options = {
      presets: this.presets,
      format: 'mediumDate',
      range: this.presets[2].range,
      applyLabel: "Submit",
      placeholder: "",
      calendarOverlayConfig: {
        shouldCloseOnBackdropClick: false
      }
    };
  }

  openCampInfo(id) {
    const dialogRef = this.dialog.open(CampaignInfoComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: id
    });
  }

  audienceTargetDisplay() {
    return this.accInfo.personalization_blacklist_entries.length > 0 
    || this.accInfo.personalization_targets.length > 0 ? 
    `${this.accInfo.personalization_blacklist_entries.length} excluded, ${this.accInfo.personalization_targets.length} included`
    : 'None';
  }

  pubTargetDisplay() {
    return this.accInfo.blacklist_ids.length > 0 
    || this.accInfo.whitelist_ids.length > 0 ? 
    `${this.accInfo.blacklist_ids.length} excluded, ${this.accInfo.whitelist_ids.length} included`
    : 'Targeting All';
  }

  setupPresets() {
    const backDate = (numOfDays) => {
      const today = new Date();
      return new Date(today.setDate(today.getDate() - numOfDays));
    }
    
    const today = new Date();
    const yesterday = backDate(1); 
    const currMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currYearStart = new Date(today.getFullYear(), 0, 1);
    
    this.presets =  [
      {presetLabel: "Today", range:{ fromDate:today, toDate:today }},
      {presetLabel: "Yesterday", range:{ fromDate:yesterday, toDate:today }},
      {presetLabel: "Last 7 Days", range:{ fromDate: backDate(7), toDate:today }},
      {presetLabel: "Last 30 Days", range:{ fromDate: backDate(30), toDate:today }},
      {presetLabel: "Last 90 Days", range:{ fromDate: backDate(90), toDate:today }},
      {presetLabel: "Month to Date", range:{ fromDate: currMonthStart, toDate:today }},
      {presetLabel: "Year to Date", range:{ fromDate: currYearStart, toDate:today }}
    ]
  }

  applyFilter(filterValue: string) {
    this.nameFilter = filterValue.trim().toLowerCase();
    this.dataSource.filter = "filter";
  }

  updateRange(range: Range){
    if(range) {
      this.range = range;
    }
    this.dataSource.filter = "filter";
  } 

  redirect(url: string) {
    window.top.location.href = `${environment.frameUrl}/${url}`; 
  }

  getCampaignPerformances(): void {
    if(this.loading) return;
    this.dataSource.filter = "";
    this.loading = true;
    this.campaignPerformanceService.getCamps(this.accid, this.active)
    .subscribe((data: ApiAnswer) => {
      if(data.data && data.data.length > 0) {
        this.campaignPerformance = data.data;
        this.dataSource = new MatTableDataSource(this.campaignPerformance);
        this.dataSource.sortingDataAccessor = (item, property) => {
        switch(property) {
          case 'campaign_name': return item.campaign_name.toLowerCase();
          default: return item[property];
          }
        };
        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.filterPredicate =
            (data: CampaignPerformance, filter: string) => {
              let filtered = true;
              if(this.nameFilter) {
                filtered = data.campaign_name.toLowerCase().indexOf(this.nameFilter) > -1;
              }
              if(this.dateFilterChecked) {
                if(data.first_impression_at == undefined) {
                  filtered = false;
                } else {
                  let campDate = moment(data.first_impression_at, "DD-MM-YYYY").toDate();
                  filtered = campDate >= this.range.fromDate && campDate <= this.range.toDate;
                }
              }
              return filtered; 
            }
        });
      } else {
        this.campaignPerformance = [];
        this.dataSource = new MatTableDataSource(this.campaignPerformance);
      }
      this.loading = false;
    });
  }

  updatePacing() {
    this.updatePacingStatus = true;
    this.accService.updateAccInfo(this.accid, "pacing", {"is_pacing_enabled": this.accInfo.is_pacing_enabled}).subscribe((data: ApiAnswer) => {
      this.updatePacingStatus = false;
    });
  }

  updateFunds() {
    this.updateNumbers = true;
    this.accService.updateAccInfo(this.accid, "remaining_budget", {"dollars_remaining": this.fundsFormControl.value}).subscribe((data: ApiAnswer) => {
      this.updateNumbers = false;
      this.accInfo.dollars_remaining = this.fundsFormControl.value;
      this.fundsFormControl.markAsPristine();
      this.fundsFormControl.markAsUntouched();
      this.editableInput.forEach(item => item.nativeElement.blur());
    });
  }

  updateClientBudget() {
    this.updateNumbers = true;
    this.accService.updateAccInfo(this.accid, "daily_client_budget", {"daily_client_budget_dollars": this.clientBFormControl.value}).subscribe((data: ApiAnswer) => {
      this.updateNumbers = false;
      this.accInfo.daily_client_budget_dollars = this.clientBFormControl.value;
      this.clientBFormControl.markAsPristine();
      this.clientBFormControl.markAsUntouched();
      this.editableInput.forEach(item => item.nativeElement.blur());
    });
  }

  updateOptBudget() {
    this.updateNumbers = true;
    this.accService.updateAccInfo(this.accid, "daily_budget", {"daily_budget_dollars": this.optBFormControl.value}).subscribe((data: ApiAnswer) => {
      this.updateNumbers = false;
      this.accInfo.daily_budget_dollars = this.optBFormControl.value;
      this.optBFormControl.markAsPristine();
      this.optBFormControl.markAsUntouched();
      this.editableInput.forEach(item => item.nativeElement.blur());
    });
  }

  updateExpBudget() {
    this.updateNumbers = true;
    this.accService.updateAccInfo(this.accid, "daily_budget_exploration", {"daily_budget_exploration_dollars": this.expBFormControl.value}).subscribe((data: ApiAnswer) => {
      this.updateNumbers = false;
      this.accInfo.daily_budget_exploration_dollars = this.expBFormControl.value;
      this.expBFormControl.markAsPristine();
      this.expBFormControl.markAsUntouched();
      this.editableInput.forEach(item => item.nativeElement.blur());
    });
  }

  updateMinAllowAge() {
    this.updateNumbers = true;
    this.accService.updateAccInfo(this.accid, "min_allowed_age", {"min_allowed_age": this.ageFormControl.value}).subscribe((data: ApiAnswer) => {
      this.updateNumbers = false;
      this.accInfo.min_allowed_age = this.ageFormControl.value;
      this.ageFormControl.markAsPristine();
      this.ageFormControl.markAsUntouched();
      this.editableInput.forEach(item => item.nativeElement.blur());
    });
  }

  openPubTargeting() {
    const dialogRef = this.dialog.open(PubliherTargetingComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {
        "include": this.accInfo.whitelist_ids, 
        "id": this.accid, 
        "exclude": this.accInfo.blacklist_ids, 
        "name": this.accInfo.account_name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.accInfo.whitelist_ids = result.include;
        this.accInfo.blacklist_ids = result.exclude;
      }
    });
  }

  openDateTimeTargeting() {
    const dialogRef = this.dialog.open(DatetimeTargetingComponent, {
      width: '850px',
      height: '445px',
      maxWidth: '850px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {
        "id": this.accid, 
        "targets": this.accInfo.account_day_hour_targets, 
        "timezone": this.accInfo.time_zone_offset
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.accInfo.account_day_hour_targets = result.account_day_hour;
        this.accInfo.time_zone_offset = result.offset;
      }
    });
  }

  openAudienceTargeting() {
    const dialogRef = this.dialog.open(AudienceTargetingComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {
        "include": this.accInfo.personalization_targets, 
        "product_id": this.accInfo.fiksu_app_id,
        "acc_id": this.accid,
        "exclude": this.accInfo.personalization_blacklist_entries, 
        "name": this.accInfo.account_name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.accInfo.personalization_targets = result.include;
        this.accInfo.personalization_blacklist_entries = result.exclude;
      }
    });
  }

}
