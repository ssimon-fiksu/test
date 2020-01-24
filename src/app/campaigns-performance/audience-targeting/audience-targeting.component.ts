import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CampaignPerformanceService } from '../campaign-performance.service';
import { AccountService } from '../../accounts/account.service';
import { ApiAnswer } from '../../api-answer';

export class PubTargeting {
  product_id: string;
  acc_id: string;
  include: [];
  exclude: [];
  name: string;
}

@Component({
  selector: 'app-audience-targeting',
  templateUrl: './audience-targeting.component.html',
  styleUrls: ['./audience-targeting.component.less']
})
export class AudienceTargetingComponent implements OnInit {

  loading = false;
  audList = [];
  filteredAudList = [];
  selected: PubTargeting = new PubTargeting();
  exclude = [];
  audienceType = "";
  audienceTypes = [
    {name: "All", value: ""},
    {name: "Custom Audiences", value: "custom"},
    {name: "Fiksu Personas", value: "personas"},
    {name: "Fiksu Lookalikes", value: "looka"},
    {name: "External Audiences", value: "external"}
  ];

  constructor(public dialogRef: MatDialogRef<AudienceTargetingComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: PubTargeting,
    private campaignPerformanceService: CampaignPerformanceService,
    private accountService: AccountService) {
    this.selected.product_id = data.product_id;
  }

  ngOnInit() {
    if(this.loading) return;
    this.loading = true;
    this.accountService.getAudiences(this.data.product_id)
    .subscribe((data: ApiAnswer) => {
      if(data.data && data.data.length > 0) {
        this.audList = data.data;
        this.filteredAudList = this.audList;
        this.selected.include = this.data.include;
        this.selected.exclude = this.data.exclude;
      }
      this.loading = false;
    });
  }

  disableItems(item, aud, array) {
    item.disabled = this.selected[array].indexOf(aud.short_name) > -1;
  }

  filter(type) {
    let filtered = this.audList.filter((el, index, array) => {
      switch (type) {
        case "custom":
          return [13,14,21,24,25,26,27,28,30,31].indexOf(el.audience_type_id) == -1;
          break;
         case "personas":
          return el.audience_type_id == 14;
          break;
         case "looka":
          return [21,24,25,26,27,28,30,31].indexOf(el.audience_type_id) > -1;
          break;
         case "external":
          return el.audience_type_id == 13 && this.data.product_id == el.product_id;
          break;
        default:
          return true;
          break;
      }
    });
    return filtered;
  }

  save() {
    let data = {
      "personalization_blacklists": this.selected.exclude,
      "personalization_targets": this.selected.include
    }
    this.loading = true;
    this.accountService.updateAudiences(this.data.acc_id, data)
      .subscribe((data: ApiAnswer) => {
        this.loading = false;
        if(data.success) this.dialogRef.close(this.selected);
      });
  }
}
