import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from '../auth/auth.service';
import { MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { AdvertiserService } from '../advertisers/advertisers.service';
import { ApiAnswer } from '../api-answer';

import { Advertiser } from '../advertisers/advertiser';
import { ClientService } from '../clients/client.service';
import { Client } from '../clients/client';
import { Product } from './product';
import { ProductForm } from './productForm';
import { ProductsService } from './products.service';
import { ProductCreateModalComponent } from './product-create-modal/product-create-modal.component';
import { ProductConfigModalComponent } from './product-config-modal/product-config-modal.component';
import { ProductAddModalComponent } from './product-add-modal/product-add-modal.component';
import { EventsModalComponent } from './events-modal/events-modal.component';
import { ViewProductModalComponent } from './view-product-modal/view-product-modal.component';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.less']
})
export class ProductsComponent implements OnInit {

  selectedClient: Client;
  selectedAdv: Advertiser;
  products: Product[] = [];
  active = 'true';
  dataSource = new MatTableDataSource<any>();
  loading = false;
  displayedColumns: string[] = ["application_name", "type", "actions"];

  constructor(private permissionsService: NgxPermissionsService,
    private authService: AuthService,
    private advertiserService: AdvertiserService,
    public dialog: MatDialog,
    private clientService: ClientService,
    private productsService: ProductsService) { }

  ngOnInit() {
    this.permissionsService.loadPermissions(this.authService.userRoles);
    this.dataSource = new MatTableDataSource(this.products);
    this.clientService.getSelectedClient.subscribe((client: Client) => {
      this.selectedClient = client; 
      this.resetProducts();
    });
    this.advertiserService.getSelectedAdvertiser.subscribe((adv: Advertiser) => {
      this.resetProducts();
      if(adv && adv.public_identifier && (!this.selectedAdv || adv.public_identifier != this.selectedAdv.public_identifier)) {
        this.selectedAdv = adv;
        this.getProducts();
      }
    });
  }

  @ViewChild(MatSort, {static: false}) sort: MatSort;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  resetProducts() {
    this.products = [];
    this.dataSource = new MatTableDataSource(this.products);
  }

  getProducts(): void {
    this.dataSource.filter = "";
    this.loading = true;
    this.productsService.getProducts(this.selectedAdv.public_identifier)
    .subscribe((data: ApiAnswer) => {
      if(data.data && data.data.length > 0) {
        this.products = data.data;
        this.dataSource = new MatTableDataSource(this.products);
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch(property) {
            case 'application_name': return item.application_name.toLowerCase();
            default: return item[property];
          }
        };
        setTimeout(() => { 
          this.dataSource.sort = this.sort;
           this.dataSource.filterPredicate =
            (data: Product, filter: string) => {
              let filtered = true;
              return data.application_name.toLowerCase().indexOf(filter) > -1;
            };
        });
      } else this.resetProducts();
      this.loading = false;
    });
  }

  createProduct() {
    const dialogRef = this.dialog.open(ProductCreateModalComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {'advId': this.selectedAdv.public_identifier}
    });
    dialogRef.afterClosed().subscribe((result: ProductForm) => {
      if(result) {
        if(result['brand']) this.getProducts();
        else {
          result.advertiser_public_identifier = this.selectedAdv.public_identifier;
          result.is_paid = false;
          result.bundle_id = result.bundle_id || '';
          this.addProduct(result);
        }

      }
    });
  }

  addProduct(data) {
    const dialogRef = this.dialog.open(ProductAddModalComponent, {
      width: '400px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: data
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
       if(result.config) this.productSettings(result.product);
       else this.getProducts();
      }
    });
  }

  productSettings(product: Product) {
    const dialogRef = this.dialog.open(ProductConfigModalComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {
        'advRef': this.selectedAdv.public_identifier, 
        'appRef': product.public_identifier, 
        'clientRef': this.selectedClient.client_api_ref,
        'type': product.type
      }
    });
  }

  viewProduct(product: Product) {
    const dialogRef = this.dialog.open(ViewProductModalComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {
        'advRef': this.selectedAdv.public_identifier, 
        'appRef': product.public_identifier, 
        'clientRef': this.selectedClient.client_api_ref,
        'type': product.type
      }
    });
  }

  eventsSettings(product) {
    const dialogRef = this.dialog.open(EventsModalComponent, {
      width: '600px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: { 'pRef': product.p_ref }
    });
  }

  redirect(url: string) {
    window.top.location.href = `${environment.frameUrl}/${url}`; 
  }

}
