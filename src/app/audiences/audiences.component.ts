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

import { AudienceInfoComponent } from './audience-info/audience-info.component';
import { Audience } from './audience';
import { AudienceService } from './audience.service';
import { EditAudienceComponent } from './newedit-modal/edit.component';
import { UploadAudienceComponent } from './upload-audience/upload-audience.component';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-audiences',
  templateUrl: './audiences.component.html',
  styleUrls: ['./audiences.component.less']
})
export class ExternalAudiencesComponent implements OnInit {

  audiences: Audience[] = [];
  active = 'true';
  selectedProduct: Product;
  dataSourceExternal = new MatTableDataSource<Audience>();
  dataSourceLookalike = new MatTableDataSource<Audience>();
  menuOpened = false;
  savingSynd = false;
  loadingProducts = false;
  loading = false;
  selectedClient: Client;
  selectedAdv: Advertiser;
  advertisers: Advertiser[] = [];
  products: Product[] = [];
  displayedColumns: string[] = ["name", "size", "external_id", "show", "updated_at", "upload", "syndication", "actions"];
  lookalikeDisplayedColumns: string[] = ["audience_name", "size", "lookalike_size", "syndication"];
  
  // @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild('eBSort', {static: false}) eBSort: MatSort;
  @ViewChild('lBSort', {static: false}) lBSort: MatSort;

  constructor(
    private permissionsService: NgxPermissionsService,
    private authService: AuthService,
    private audienceService: AudienceService,
    private clientService: ClientService,
    private productsService: ProductsService,
    private advertiserService: AdvertiserService,
    public dialog: MatDialog,) {}

  ngOnInit() {
    this.permissionsService.loadPermissions(this.authService.userRoles);
    this.dataSourceExternal = new MatTableDataSource([]);
    this.dataSourceLookalike = new MatTableDataSource([]);
    this.loadingProducts = true;
    if(!this.permissionsService.getPermission('external audience editor')) {
      this.displayedColumns.pop();
      this.displayedColumns.pop();
      this.displayedColumns.pop();
      this.displayedColumns.push("syndication_view");
    }
    this.productsService.getSelectedProduct
    .subscribe((product: Product) => {
      this.resetAuds();
      if(product && product.p_ref && (!this.selectedProduct || product.p_ref != this.selectedProduct.p_ref)) {
        this.selectedProduct = product;
        this.loadingProducts = false;
        this.getAudiences();
      }
    });
    this.clientService.getSelectedClient.subscribe((client: Client) => {this.resetAuds(); this.selectedClient = client});

    this.advertiserService.getSelectedAdvertiser.subscribe((adv: Advertiser) => {this.selectedAdv = adv; this.resetAuds(); this.selectedProduct = null;});
  }


  resetAuds() {
    this.audiences = [];
    this.dataSourceExternal = new MatTableDataSource([]);
    this.dataSourceLookalike = new MatTableDataSource([]);
  }


  getAudiences() {
    if(!this.selectedProduct) return;
    this.loading = true;
    this.dataSourceExternal.filter = "";
    this.audienceService.getProductAudiences(this.selectedProduct.app_ref, this.selectedAdv.public_identifier)
    .subscribe((data: ApiAnswer) => {
      if(data.data && data.data.length > 0) {
        this.audiences = data.data;
        let external = this.audiences.filter(aud => aud["audience_type_id"] == 13);
        let lookalike = this.audiences.filter(aud => aud["seed_id"] !== aud["audience_configuration_id"]);
        this.dataSourceExternal = new MatTableDataSource(external);
        this.dataSourceLookalike = new MatTableDataSource(lookalike);
        this.dataSourceExternal.sortingDataAccessor = (item: Audience, property) => {
        switch(property) {
          case 'name': return (item.external_info["name"] + "").toLowerCase();
          case 'external_id': return item.external_info["external_id"];
          case 'updated_at': return item.external_info["updated_at"];
          default: return item[property];
          }
        };
        this.dataSourceLookalike.sortingDataAccessor = (item: Audience, property) => {
        switch(property) {
          case 'name': return (item.audience_name + "").toLowerCase();
          case 'lookalike_size': return item.lookalike_sizes[0];
          default: return item[property];
          }
        };
        setTimeout(() => {
          this.dataSourceExternal.sort = this.eBSort;
          this.dataSourceLookalike.sort = this.lBSort;
        });
      } else this.resetAuds();
      this.loading = false;
    });
  }

  openModal(extId) {
    const dialogRef = this.dialog.open(AudienceInfoComponent, {
      width: '800px',
      minHeight: '200px',
      panelClass: "overflow-dialog",
      autoFocus: false,
      data: extId
    });
  }

  createNewAud() {
    const dialogRef = this.dialog.open(EditAudienceComponent, {
      width: '400px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {product: this.selectedProduct, client: this.selectedClient, adv: this.selectedAdv}
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data) {
        if(data.upload) this.uploadAud(data.aud.audience_external_id, true);
        else this.getAudiences();
      }
    });
  }

  editAud(aud) {
    const dialogRef = this.dialog.open(EditAudienceComponent, {
      width: '400px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {product: this.selectedProduct, aud: aud, client: this.selectedClient, adv: this.selectedAdv}
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data) {
        this.getAudiences();
      }
    });
  }

  uploadAud(external_id, reload) {
    const dialogRef = this.dialog.open(UploadAudienceComponent, {
      width: '400px',
      minHeight: '200px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: {'client_api_ref': this.selectedClient.client_api_ref, 'external_id': external_id}
    });
    
    dialogRef.afterClosed().subscribe(data => {
      if(reload) {
        this.getAudiences();
      }
    });
  }

  audCheck(aud) {
    if(!aud.temp_adnetwork_ids)  { 
      aud.temp_adnetwork_ids = []; 
      Object.assign(aud.temp_adnetwork_ids, aud.adnetwork_ids); 
    }
    if(aud.adnetwork_ids.length == 0) {
      aud.adnetwork_ids.push(42);
    } else {
      aud.adnetwork_ids = [];
    }
    aud["check"] = true;
  }

  blur(aud) {
    if(aud["check"] && aud["menu"]) {
      aud["check"] = false;
      aud["menu"] = false;
      aud.adnetwork_ids = aud.temp_adnetwork_ids;
      delete aud.temp_adnetwork_ids;
    }
    if(!this.savingSynd && aud["menu"]) {
      aud["menu"] = false;
    }
  }

  removeAud(aud) {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      minHeight: '100px',
      panelClass: "targeting-dialog",
      autoFocus: false,
      data: "Are you sure you want to delete this audience?"
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data) {
        this.deleteAud(aud);
      }
    });
  }

  deleteAud(aud: Audience) {
    this.loading = true;
    let dataSynd = {
      "syndication_configuration_id": aud.id,
      "audience_configuration_id": aud.audience_configuration_id,
      "app_ref": this.selectedProduct.app_ref,
      "advertiser_public_identifier": this.selectedAdv.public_identifier
    }
    this.audienceService.deleteAudience(dataSynd)
    .subscribe((data: ApiAnswer) => {
      this.loading = false;
      this.getAudiences();
    });
  }

  saveSynd(aud: Audience) {
    if(this.savingSynd) return;
    aud["menu"] = false;
    this.savingSynd = true;
    let dataSynd = {
      "syndication_configuration_id": aud.id,
      "adnetwork_ids": aud.adnetwork_ids,
      "syndicate_to_rtb": aud.adnetwork_ids.length > 0, 
      "client_api_ref": this.selectedClient.client_api_ref,
      "app_ref": this.selectedProduct.app_ref
    }
    this.audienceService.updateSyndication(dataSynd)
    .subscribe((data: ApiAnswer) => {
      this.savingSynd = false;
      aud["check"] = false;
    });
  }

  redirect(url: string) {
    window.top.location.href = `${environment.frameUrl}/${url}`; 
  }

}
