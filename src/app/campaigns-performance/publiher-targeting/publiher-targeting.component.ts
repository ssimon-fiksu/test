import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CampaignPerformanceService } from '../campaign-performance.service';
import { AccountService } from '../../accounts/account.service';
import { ApiAnswer } from '../../api-answer';
import { saveAs } from 'file-saver';

import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from '../../auth/auth.service';

export class PubTargeting {
  id: string;
  include: [];
  exclude: [];
  name: string;
}

@Component({
  selector: 'app-publiher-targeting',
  templateUrl: './publiher-targeting.component.html',
  styleUrls: ['./publiher-targeting.component.less']
})
export class PubliherTargetingComponent implements OnInit {

  loading = false;
  pubList = [];
  selected: PubTargeting = new PubTargeting();
  exclude = [];

  constructor(public dialogRef: MatDialogRef<PubliherTargetingComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: PubTargeting,
    private campaignPerformanceService: CampaignPerformanceService,
    private accountService: AccountService,
    private permissionsService: NgxPermissionsService,
    private authService: AuthService) {
    this.selected.id = data.id;
  }

  ngOnInit() {
    this.permissionsService.loadPermissions(this.authService.userRoles);
    if(this.loading) return;
    this.loading = true;
    this.campaignPerformanceService.getSiteLists(this.data.id)
    .subscribe((data: ApiAnswer) => {
      if(data.data) {
        this.pubList = data.data;
        this.selected.include = this.data.include;
        this.selected.exclude = this.data.exclude;
      }
      this.loading = false;
    });
  }

  disableItems(item, pub, array) {
    item.disabled = this.selected[array].indexOf(pub.external_id) > -1;
  }

  save() {
    let data = {
      "excluded_publisher_list": this.selected.exclude,
      "included_publisher_list": this.selected.include
    }
    this.loading = true;
    this.accountService.updatePubLists(this.selected.id, data)
      .subscribe((data: ApiAnswer) => {
        this.loading = false;
        if(data.success) this.dialogRef.close(this.selected);
      });
  }

  downloadListData() {
    this.loading = true;
    this.accountService.publisherCsv(this.data.id)
    .subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'text/csv' });
      saveAs(blob, `Lists in product ${this.data.name}.csv`);
      this.loading = false;
    });
  }

}
