import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Account } from './account';
import { ApiAnswer } from '../api-answer';
import { FundingPopupComponent } from './funding-popup/funding-popup.component';
import { MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { AccountService } from './account.service';
import { environment } from '../../environments/environment';

import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.less']
})

export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  totals = {};
  active = 'true';
  dataSource = new MatTableDataSource<Account>();
  loading = false;
  displayedColumns: string[] = [
  "fiksu_app_id", "account_name", "device_class",   "active_account_campaigns",  "funds_remaining", "impressions_today", 
  "clicks_today", "conversions_today", "client_spend_today", "media_spend_today", "profit_today", "margin_today", "actions"];

  totalsColumns: string[] = [ "empty", "empty","empty" ,"empty",
    "total_funds_remaining","total_impressions_today","total_clicks_today","total_conversions_today","total_client_spend_today",
    "total_media_spend_today","total_profit_today","total_margin_today","empty"
    ]; 
  
  constructor(private accountService: AccountService, 
    public dialog: MatDialog, 
    private permissionsService: NgxPermissionsService,
    private authService: AuthService) { }

  @ViewChild(MatSort, {static: false}) sort: MatSort;

  ngOnInit() {
    this.permissionsService.loadPermissions(this.authService.userRoles);
    this.getAccounts();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openFundings(ac) {
    const dialogRef = this.dialog.open(FundingPopupComponent, {
      width: '400px',
      data: {funds_remaining: ac.funds_remaining, id: ac.public_identifier}
    });

    dialogRef.afterClosed().subscribe(result => {
      var i = this.dataSource.data.indexOf(ac);
      if(result) this.dataSource.data[i].funds_remaining = result;
    });
  }

  redirect(url: string) {
    window.top.location.href = `${environment.frameUrl}/${url}`; 
  }

  getAccounts(): void {
    if(this.loading) return;
    this.dataSource.filter = "";
    this.loading = true;
    this.accountService.getAccounts(this.active)
    .subscribe((data: ApiAnswer) => {
      if(data.data) {
        this.accounts = data.data['accounts'];
        this.totals = data.data["total"]
        this.dataSource = new MatTableDataSource(this.accounts);
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch(property) {
            case 'active_account_campaigns': return item.active_account_campaigns['active_campaigns_count'];
            case 'account_name': return item.account_name.toLowerCase();
            default: return item[property];
          }
        };
        setTimeout(() => this.dataSource.sort = this.sort);
      }
      this.loading = false;
    });
  }

}

