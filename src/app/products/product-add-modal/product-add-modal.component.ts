import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { ApiAnswer } from '../../api-answer';
import { ProductForm } from '../productForm';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-product-add-modal',
  templateUrl: './product-add-modal.component.html',
  styleUrls: ['./product-add-modal.component.less']
})
export class ProductAddModalComponent implements OnInit {

  loading = false;

  constructor(public dialogRef: MatDialogRef<ProductAddModalComponent>, 
    private productsService: ProductsService,
    @Inject(MAT_DIALOG_DATA) public data: ProductForm) {}

  ngOnInit() {
  }

  save(config) {
    this.loading = true;
    this.productsService.createProduct(this.data)
     .subscribe((data: ApiAnswer) => {
        this.loading = false;
        if(data.success) {
          this.dialogRef.close({"product": data.data, "config": config});
        }
    });
  }

}
