import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';


@Injectable()
export class ProductProvider {

    private currentProduct: BehaviorSubject<string>;

    constructor() {
      this.currentProduct = new BehaviorSubject<string>(localStorage.getItem('app_ref'));
    }

    get product(): string {
      this.checkProduct();
      return this.currentProduct.value;
    }

    getProduct() {
      this.checkProduct();
      return this.currentProduct.asObservable();
    }

    checkProduct() {
      let product = this.getProductParam();
      if(this.currentProduct.value != product ) {
        localStorage.setItem('app_ref', product);
        this.currentProduct.next(product);
      }
    }

    getProductParam() {
      let url = new URL(window.location.href);
      return url.searchParams.get("app");
    }
}
