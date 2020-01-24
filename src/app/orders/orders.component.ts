import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from '../auth/auth.service';
import { MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { IOService } from './order.service';
import { ApiAnswer } from '../api-answer';
import { saveAs } from 'file-saver';

import { IO } from './order';
import { OrderEditComponent } from './order-edit-popup/order-edit.component';
import { ClientService } from '../clients/client.service';
import { Client } from '../clients/client';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.less']
})
export class OrdersComponent implements OnInit {

  loadingFile = false;
  ios: IO[] = [];
  selectedClient: Client;
  dataSource = new MatTableDataSource<any>();
  loading = false;
  displayedColumns: string[] = ["name", "advertiser_name", "actions"];

  constructor(private permissionsService: NgxPermissionsService,
    private authService: AuthService,
    private ioService: IOService,
    private clientService: ClientService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.permissionsService.loadPermissions(this.authService.userRoles);
    this.dataSource = new MatTableDataSource(this.ios);
    this.loading = true;
    this.clientService.getSelectedClient
    .subscribe((client: Client) => {
      if(client && (!this.selectedClient || client.client_api_ref != this.selectedClient.client_api_ref)) {
        this.selectedClient = client;
        this.getOrders();
      }
    })
  }

  @ViewChild(MatSort, {static: false}) sort: MatSort;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getOrders(): void {
    this.dataSource.filter = "";
    this.loading = true;
    this.ios = [];
    this.ioService.getOrders(this.selectedClient.client_api_ref)
    .subscribe((data: ApiAnswer) => {
      if(data.data && data.data.length > 0) {
        this.ios = data.data;
        this.dataSource = new MatTableDataSource(this.ios);
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch(property) {
            case 'name': return item['name'];
            default: return item[property];
          }
        };
        setTimeout(() => this.dataSource.sort = this.sort);
      } else {
        this.ios = [];
        this.dataSource = new MatTableDataSource(this.ios);
      }
      this.loading = false;
    });
  }

  downloadOrder(order: IO) {
    this.loadingFile = true;
    this.ioService.downloadOrder(order.public_identifier)
    .subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'text/*' });
      saveAs(blob, order.filename);
      this.loadingFile = false;
    });
  }

  removeOrder(aud) {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      minHeight: '100px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: "Are you sure you want to delete this order?"
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data) {
        this.deleteOrder(aud);
      }
    });
  }

  deleteOrder(order: IO) {
    this.loading = true;
    this.ioService.deleteOrder(order.public_identifier)
    .subscribe((data: ApiAnswer) => {
      this.loading = false;
      this.getOrders();
    });
  }

  openModal(public_identifier) {
    const dialogRef = this.dialog.open(OrderEditComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {'public_identifier': public_identifier, 'client_ref': this.selectedClient.client_api_ref}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
       this.getOrders();
      }
    });
  }

}
