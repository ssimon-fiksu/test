import { NgModule } from  '@angular/core';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatAutocompleteModule,
  MatNativeDateModule,
  MatSnackBarModule,
  MatIconModule,
  MatDialogModule,
  MatButtonModule,
  MatTableModule,
  MatPaginatorModule ,
  MatSortModule,
  MatTabsModule,
  MatCheckboxModule,
  MatToolbarModule,
  MatCard,
  MatCardModule,
  MatFormField,
  MatFormFieldModule,
  MatProgressSpinnerModule,
  MatInputModule,
  MatExpansionModule,
  MatListModule,
  MatTreeModule,
  MatTooltipModule,
  MatChipsModule,
  MatSlideToggleModule
} from  '@angular/material';
import {MatDatepickerModule} from  '@angular/material/datepicker';
import {MatRadioModule} from  '@angular/material/radio';
import {MatSelectModule} from  '@angular/material/select';
import {MatSliderModule} from  '@angular/material/slider';
import {MatDividerModule} from  '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';

@NgModule({
imports: [
  MatTabsModule,
  MatDividerModule,
  MatSliderModule,
  MatSelectModule,
  MatRadioModule,
  MatNativeDateModule,
  MatDatepickerModule,
  MatSnackBarModule,
  MatIconModule,
  MatDialogModule,
  MatProgressSpinnerModule,
  MatButtonModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatCheckboxModule,
  MatToolbarModule,
  MatCardModule,
  MatFormFieldModule,
  MatProgressSpinnerModule,
  MatInputModule,
  MatPaginatorModule],
  exports: [MatTabsModule,
  MatDividerModule,
  MatSliderModule,
  MatSelectModule,
  MatRadioModule,
  MatNativeDateModule,
  MatDatepickerModule,
  MatSnackBarModule,
  MatIconModule,
  MatDialogModule,
  MatProgressSpinnerModule,
  MatButtonModule,
  MatSortModule,
  MatCheckboxModule,
  MatToolbarModule,
  MatCardModule,
  MatTableModule,
  MatTabsModule,
  MatFormFieldModule,
  MatProgressSpinnerModule,
  MatInputModule,
  MatPaginatorModule,
  MatAutocompleteModule,
  MatExpansionModule,
  MatListModule,
  MatTreeModule,
  MatTooltipModule,
  MatChipsModule,
  MatSlideToggleModule,
  MatMenuModule
 ],
providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {duration: 5000}}
  ],
})

export  class  MyMaterialModule { }