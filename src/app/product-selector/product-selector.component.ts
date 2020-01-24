import { Component, OnInit } from '@angular/core';
import { ApiAnswer } from '../api-answer';
import { AdvertiserService } from '../advertisers/advertisers.service';
import { Advertiser } from '../advertisers/advertiser';

import { Product } from '../products/product';
import { ProductsService } from '../products/products.service';
import { ClientService } from '../clients/client.service';
import { Client } from '../clients/client';

@Component({
  selector: 'app-product-selector',
  templateUrl: './product-selector.component.html',
  styleUrls: ['./product-selector.component.less']
})

export class ProductSelectorComponent implements OnInit {

  selectedAdv: Advertiser;
  appRef: string;
  loading = false;
  productsData: Product[] = [];
  selectedProduct: Product;

  constructor(
    private advService: AdvertiserService, 
    private productsService: ProductsService,
    private clientService: ClientService) {
  }

  ngOnInit() {
    this.loading = true;
    this.appRef = localStorage.getItem('app_ref');
    this.advService.getSelectedAdvertiser
    .subscribe((adv: Advertiser) => {
      if(adv && adv.public_identifier && (!this.selectedAdv || adv.public_identifier != this.selectedAdv.public_identifier)) {
        this.selectedAdv = adv;
        this.getProducts();
      }
    });
    this.clientService.getSelectedClient
    .subscribe((client: Client) => {
      this.selectedAdv = null;
      this.loading = true;
      this.selectedProduct = null;
      this.productsData = [];
    });
  }

  productChanged() {
    if (this.selectedProduct) { 
      this.productsService.updateSelectedProduct(this.selectedProduct);
      this.appRef = localStorage.getItem('app_ref');
    }
  }

  getProducts() {
    this.loading = true;
    this.productsData = [];
    return this.productsService.getProducts(this.selectedAdv.public_identifier)
      .subscribe((data: ApiAnswer) => {
        if(data.data && data.data.length > 0) {
          this.productsData = data.data;
          if(this.appRef) {
            this.selectedProduct = this.productsData.filter(product => this.appRef == product.app_ref)[0];
            if(this.selectedProduct) this.productsService.updateSelectedProduct(this.selectedProduct);
            else this.productsService.removeSelectedProduct();
          }
        } else if(this.appRef) this.productsService.removeSelectedProduct();
        this.loading = false;
    });
  }

}
