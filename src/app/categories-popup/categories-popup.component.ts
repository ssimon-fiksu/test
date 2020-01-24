import {Component, Inject, OnInit, ViewChildren, QueryList} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatListOption} from '@angular/material';
import {FormControl, Validators} from '@angular/forms';

import { MyErrorStateMatcher } from '../error-state-mather';
import { AccountService } from '../accounts/account.service';
import { ApiAnswer } from '../api-answer';

export interface CatPopData {
  name: string;
  cats: any;
  selectedCats: string[]
}

@Component({
  selector: 'app-categories-popup',
  templateUrl: './categories-popup.component.html',
  styleUrls: ['./categories-popup.component.less']
})
export class CategoriesPopupComponent {

  matcher = new MyErrorStateMatcher();
  loading = false;
  catSelected: string[];
  dataAllSelected: string[] = [];

  @ViewChildren(MatListOption) categories !: QueryList<MatListOption>;

  constructor(public dialogRef: MatDialogRef<CategoriesPopupComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: CatPopData) { 
      this.catSelected = data.selectedCats;
      Object.assign(this.dataAllSelected, data.selectedCats);
    }

  stopBubble(event: Event, cat: any, selected: boolean) {
    event.stopPropagation();
    this.checkUncheckParent(cat, selected);
  }

  checkUncheckParent(cat: any, selected: boolean) {
    if(selected) {
      this.dataAllSelected.push(cat.public_identifier);
    } else {
      if(cat.child_categories && cat.child_categories.length > 0) {
        for (let ccat of cat.child_categories) {
          const index = this.dataAllSelected.indexOf(ccat.public_identifier, 0);
          if (index > -1) {
            this.dataAllSelected.splice(index, 1);
            this.categories.find(f => f && f.value == ccat.public_identifier).toggle();
          }
        }
      }
      const index = this.dataAllSelected.indexOf(cat.public_identifier, 0);
      if (index > -1) {
        this.dataAllSelected.splice(index, 1);
      }
    }
  }
}
