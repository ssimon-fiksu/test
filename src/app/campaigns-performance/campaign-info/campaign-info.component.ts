import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CampaignsService } from '../../campaigns/campaigns.service';
import { AccountService } from '../../accounts/account.service';
import { ApiAnswer } from '../../api-answer';
import { CampInfo } from './camp-info';

@Component({
  selector: 'app-campaign-info',
  templateUrl: './campaign-info.component.html',
  styleUrls: ['./campaign-info.component.less']
})
export class CampaignInfoComponent implements OnInit {

  loading = false;
  campInfo: CampInfo = new CampInfo();

  constructor(public dialogRef: MatDialogRef<CampaignInfoComponent>, 
    @Inject(MAT_DIALOG_DATA) public campId: string,
    private campaignService: CampaignsService,
    private accountService: AccountService) {}


  ngOnInit() {
    if(this.loading) return;
    this.loading = true;
    this.campaignService.getInfo(this.campId)
    .subscribe((data: ApiAnswer) => {
      if(data.data) {
        this.campInfo = data.data;
      }
      this.loading = false;
    });
  }

}
