import {Component, Inject, OnInit, ViewChildren, QueryList} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatListOption} from '@angular/material';
import {FormControl, Validators} from '@angular/forms';

import { MyErrorStateMatcher } from '../../../error-state-mather';
import { ApiAnswer } from '../../../api-answer';

interface Cat {
  child_categories: Cat[]
  ct_name: string
  name: string
  public_identifier: string
}

interface CatPopData {
  name: string;
  cats: Cat[];
  includedCats: string[],
  excludedCats: string[]
}

@Component({
  selector: 'app-categories-modal',
  templateUrl: './categories-modal.component.html',
  styleUrls: ['./categories-modal.component.less']
})
export class PlacementCategoriesModalComponent {

  matcher = new MyErrorStateMatcher();
  loading = false;
  selected = {};
  dataAllSelected = {
    'included': [],
    'excluded': []
  };
  cats = [];

  @ViewChildren(MatListOption) categories !: QueryList<MatListOption>;

  constructor(public dialogRef: MatDialogRef<PlacementCategoriesModalComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: CatPopData) {
      Object.assign(this.dataAllSelected.included, data.includedCats);
      Object.assign(this.dataAllSelected.excluded, data.excludedCats);
      Object.assign(this.cats, data.cats);
      this.cats.forEach((cat) => {
        this.addCat(cat.public_identifier);
        if(cat.child_categories && cat.child_categories.length > 0) {
          cat.child_categories.forEach(subCat => {
            let catopen = this.addCat(subCat.public_identifier);
            if(catopen) cat.open = true;
          });
        }
      });
    }

  addCat(id) {
    this.selected[id] = {
      'included': this.dataAllSelected.included.indexOf(id) > -1,
      'excluded': this.dataAllSelected.excluded.indexOf(id) > -1
    }
    return this.selected[id].included || this.selected[id].excluded;
  }


  ok() {
    Object.keys(this.selected).forEach(id => {
      let incI = this.dataAllSelected.included.indexOf(id);
      let exclI = this.dataAllSelected.excluded.indexOf(id);
      if(!this.selected[id].included && incI > -1) this.dataAllSelected.included.splice(incI, 1);
      if(!this.selected[id].excluded && exclI > -1) this.dataAllSelected.excluded.splice(exclI, 1);
      if(this.selected[id].included && incI == -1) this.dataAllSelected.included.push(id);
      if(this.selected[id].excluded && exclI == -1) this.dataAllSelected.excluded.push(id);
    });
    this.dialogRef.close(this.dataAllSelected);
  }
}
