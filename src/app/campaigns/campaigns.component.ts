import { Component, OnInit, ViewChild } from '@angular/core';

import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from '../auth/auth.service';
import { ApiAnswer } from '../api-answer';
import { MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { AdvertiserService } from '../advertisers/advertisers.service';
import { Advertiser } from '../advertisers/advertiser';
import { ClientService } from '../clients/client.service';
import { Client } from '../clients/client';
import { Product } from '../products/product';
import { ProductsService } from '../products/products.service';
import { Campaign } from './campaign';
import { CampaignsService } from './campaigns.service';
import { EditCampaignComponent } from './edit-campaign-modal/edit-campaign.component';
import { environment } from '../../environments/environment';
import { ViewCampaignModalComponent } from './view-campaign-modal/view-campaign-modal.component';

@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.less']
})
export class CampaignsComponent implements OnInit {

  campaigns: Campaign[] = [];
  status = 'active';
  selectedProduct: Product;
  dataSource = new MatTableDataSource<Campaign>();
  loading = false;
  menuOpened = false;
  savingSynd = false;
  loadingProducts = false;
  selectedClient: Client;
  selectedAdv: Advertiser;
  advertisers: Advertiser[] = [];
  products: Product[] = [];
  displayedColumns: string[] = ["name", "start_date", "status", "budget", "actions"];
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  constructor(
    private permissionsService: NgxPermissionsService,
    private authService: AuthService,
    private campaignsService: CampaignsService,
    private clientService: ClientService,
    private productsService: ProductsService,
    private advertiserService: AdvertiserService,
    public dialog: MatDialog) {}

  ngOnInit() {
    this.permissionsService.loadPermissions(this.authService.userRoles);
    this.dataSource = new MatTableDataSource(this.campaigns);
    this.loadingProducts = true;
    this.productsService.getSelectedProduct
    .subscribe((product: Product) => {
      this.resetCamps();
      if(product && product.p_ref && (!this.selectedProduct || product.p_ref != this.selectedProduct.p_ref)) {
        this.selectedProduct = product;
        this.loadingProducts = false;
        this.getCampaigns();
      }
    });
    this.clientService.getSelectedClient.subscribe((client: Client) => {this.resetCamps(); this.selectedClient = client});

    this.advertiserService.getSelectedAdvertiser.subscribe((adv: Advertiser) => {this.resetCamps(); this.selectedAdv = adv;  this.selectedProduct = null;});
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  resetCamps() {
    this.campaigns = [];
    this.dataSource = new MatTableDataSource(this.campaigns);
  }

  getCampaigns() {
    if(!this.selectedProduct) return;
    this.loading = true;
    this.dataSource.filter = "";
    this.campaignsService.getProductCampaigns(this.selectedProduct.p_ref, this.status)
    .subscribe((data: ApiAnswer) => {
      if(data.data && data.data.length > 0) {
        this.campaigns = data.data;
        this.dataSource = new MatTableDataSource(this.campaigns);
        this.dataSource.sortingDataAccessor = (item: Campaign, property) => {
          switch(property) {
            case 'name': return item.name.toLowerCase();
            default: return item[property];
          }
        };
        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.filterPredicate =
            (data: Campaign, filter: string) => {
              return data.name.toLowerCase().indexOf(filter) > -1;
            }
        });
      } else this.resetCamps();
      this.loading = false;
    });
  }

  updateCampStatus(id: string, status: string) {
    this.loading = true;
    this.campaignsService.toggleStatus(id, status)
    .subscribe((data: ApiAnswer) => {
      if(data.success) {
        this.getCampaigns();
      } else this.loading = false;
      
    });
  }

  createNewCamp() {
    const dialogRef = this.dialog.open(EditCampaignComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {'product': this.selectedProduct}
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data) {
        this.getCampaigns();
      }
    });
  }

  editCamp(camp) {
    const dialogRef = this.dialog.open(EditCampaignComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {'product': this.selectedProduct, 'camp': camp}
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data) {
        this.getCampaigns();
      }
    });
  }

  viewCamp(camp) {
    const dialogRef = this.dialog.open(ViewCampaignModalComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: camp
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data) {
        this.getCampaigns();
      }
    });
  }

  redirect(url: string) {
    window.top.location.href = `${environment.frameUrl}/${url}`; 
  }

}
