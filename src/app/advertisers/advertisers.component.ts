import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from '../auth/auth.service';
import { MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { AdvertiserService } from './advertisers.service';
import { ApiAnswer } from '../api-answer';

import { Advertiser } from './advertiser';
import { AdvertiserEditComponent } from './advertiser-edit-popup/advertiser-edit.component';
import { ClientService } from '../clients/client.service';
import { Client } from '../clients/client';

@Component({
  selector: 'app-advertisers',
  templateUrl: './advertisers.component.html',
  styleUrls: ['./advertisers.component.less']
})
export class AdvertisersComponent implements OnInit {

  selectedClient: Client;
  advertisers: Advertiser[] = [];
  active = 'true';
  dataSource = new MatTableDataSource<any>();
  loading = false;
  displayedColumns: string[] = ["name", "adomain", "advertiser_url", "actions"];

  constructor(private permissionsService: NgxPermissionsService,
    private authService: AuthService,
    private advertiserService: AdvertiserService,
    public dialog: MatDialog,
    private clientService: ClientService) { }

  ngOnInit() {
    this.permissionsService.loadPermissions(this.authService.userRoles);
    this.dataSource = new MatTableDataSource(this.advertisers);
    this.loading = true;
    this.clientService.getSelectedClient
    .subscribe((client: Client) => {
      if(client && (!this.selectedClient || client.client_api_ref != this.selectedClient.client_api_ref)) {
        this.selectedClient = client;
        this.getAdvertisers();
      }
    })
  }

  @ViewChild(MatSort, {static: false}) sort: MatSort;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getAdvertisers(): void {
    this.dataSource.filter = "";
    this.loading = true;
    this.advertiserService.getAdvertisers(this.selectedClient.client_api_ref)
    .subscribe((data: ApiAnswer) => {
      if(data.data && data.data.length > 0) {
        this.advertisers = data.data;
        this.dataSource = new MatTableDataSource(this.advertisers);
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch(property) {
            case 'name': return item.name.toLowerCase();
            default: return item[property];
          }
        };
        setTimeout(() => { 
          this.dataSource.sort = this.sort;
           this.dataSource.filterPredicate =
            (data: Advertiser, filter: string) => {
              let filtered = true;
              return data.name.toLowerCase().indexOf(filter) > -1;
            };
        });
      } else {
        this.advertisers = [];
        this.dataSource = new MatTableDataSource(this.advertisers);
      }
      this.loading = false;
    });
  }

  openModal(id) {
    const dialogRef = this.dialog.open(AdvertiserEditComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {'public_identifier': id, 'client_ref': this.selectedClient.client_api_ref}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
       this.getAdvertisers();
      }
    });
  }

}
