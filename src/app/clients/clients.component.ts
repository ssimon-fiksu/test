import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ApiAnswer } from '../api-answer';
import { MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatPaginator } from '@angular/material';
import { environment } from '../../environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from '../auth/auth.service';

import { Client } from './client';
import { ClientService } from './client.service';
import { FundingModalComponent } from './funding-modal/funding-modal.component';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.less']
})
export class ClientsComponent implements OnInit {

  clients: Client[] = [];
  dataSource = new MatTableDataSource<Client>();
  loading = false;
  displayedColumns: string[] = ["name", "balance", "actions"];

  constructor(private clientService: ClientService, 
    public dialog: MatDialog, 
    private permissionsService: NgxPermissionsService,
    private authService: AuthService) { }

  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  ngOnInit() {
    this.permissionsService.loadPermissions(this.authService.userRoles);
    this.getClients();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openFundings(client: Client) {
    const dialogRef = this.dialog.open(FundingModalComponent, {
      width: '400px',
      data: client
    });

    dialogRef.afterClosed().subscribe(result => {
      var i = this.dataSource.data.indexOf(client);
      if(result) this.dataSource.data[i].balance = result;
    });
  }

  getClients(): void {
    if(this.loading) return;
    this.dataSource.filter = "";
    this.loading = true;
    this.clientService.getClients(true)
    .subscribe((data: ApiAnswer) => {
      if(data.data) {
        this.clients = data.data;
        this.dataSource = new MatTableDataSource(this.clients);
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch(property) {
            case 'name': return item.name.toLowerCase();
            default: return item[property];
          }
        };
        setTimeout(() => { 
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.dataSource.filterPredicate =
            (data: Client, filter: string) => {
              let filtered = true;
              return data.name.toLowerCase().indexOf(filter) > -1;
            };
        });
      }
      this.loading = false;
    });
  }

}
