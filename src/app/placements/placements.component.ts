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
import { CampaignsService } from '../campaigns/campaigns.service';
import { Campaign } from '../campaigns/campaign';

import { Placement } from './placement';
import { PlacementsService } from './placements.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-placements',
  templateUrl: './placements.component.html',
  styleUrls: ['./placements.component.less']
})
export class PlacementsComponent implements OnInit {

  placements: Placement[] = [];
  status = 'active';
  selectedProduct: Product;
  selectedAdv: Advertiser;
  selectedCamp: Campaign;
  camps: Campaign[] = [];

  dataSource = new MatTableDataSource<Placement>();
  loading = false;
  loadingCamps = false;
  displayedColumns: string[] = ["name", "status", "budget", "actions"];
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  constructor(
    private permissionsService: NgxPermissionsService,
    private authService: AuthService,
    private placementsService: PlacementsService,
    private clientService: ClientService,
    private productsService: ProductsService,
    private advertiserService: AdvertiserService,
    private campaignsService: CampaignsService,
    public dialog: MatDialog) {}

  ngOnInit() {
    this.loadingCamps = true;
    this.permissionsService.loadPermissions(this.authService.userRoles);
    this.dataSource = new MatTableDataSource(this.placements);
    this.productsService.getSelectedProduct
    .subscribe((product: Product) => {
      this.resetPlacements();
      if(product && product.p_ref && (!this.selectedProduct || product.p_ref != this.selectedProduct.p_ref)) {
        this.selectedProduct = product;
        this.getCampaigns();
      }
    });
    this.clientService.getSelectedClient.subscribe((client: Client) => {this.reset();});

    this.advertiserService.getSelectedAdvertiser.subscribe((adv: Advertiser) => {this.selectedAdv = adv; this.reset();});
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  reset() {
    this.selectedCamp = null;
    this.loadingCamps = true;
    this.camps = [];
    this.placements = [];
    this.dataSource = new MatTableDataSource(this.placements);
  }

  resetPlacements() {
    this.placements = [];
    this.dataSource = new MatTableDataSource(this.placements);
  }

  getCampaigns() {
    this.camps = [];
    this.selectedCamp = null;
    this.loadingCamps = true;
    this.campaignsService.getProductCampaigns(this.selectedProduct.p_ref, 'active')
    .subscribe((data: ApiAnswer) => {
      if(data.data && data.data.length > 0) {
        this.camps = data.data;
      }
      this.loadingCamps = false; 
    });
  }

  getPlacements() {
    if(!this.selectedCamp) return;
    this.loading = true;
    this.dataSource.filter = "";
    this.placementsService.getProductPlacements(this.selectedCamp.public_identifier, this.status, this.selectedProduct.p_ref)
    .subscribe((data: ApiAnswer) => {
      if(data.data && data.data.length > 0) {
        this.placements = data.data;
        this.dataSource = new MatTableDataSource(this.placements);
        this.dataSource.sortingDataAccessor = (item: Placement, property) => {
          switch(property) {
            case 'name': return item.name.toString().toLowerCase();
            default: return item[property];
          }
        };
        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.filterPredicate =
            (data: Placement, filter: string) => {
              return data.name.toString().toLowerCase().indexOf(filter) > -1;
            }
        });
      } else this.resetPlacements();
      this.loading = false;
    });
  }

  updatePlacementStatus(id: string, status: string) {
    this.loading = true;
    this.placementsService.updateStatus(id, status)
    .subscribe((data: ApiAnswer) => {
      if(data.success) {
        this.getPlacements();
      } else this.loading = false;
      
    });
  }
  
  redirect(url: string) {
    window.top.location.href = `${environment.frameUrl}/${url}`; 
  }

}
