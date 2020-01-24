import { NgModule, APP_INITIALIZER }         from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule }      from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientXsrfModule } from '@angular/common/http';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MyMaterialModule } from  './app.material.module';
import { NgxMatDrpModule } from 'ngx-mat-daterange-picker';

import { httpInterceptorProviders } from './auth/index'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService }          from './auth/auth.service';
import { HttpErrorHandler }     from './http-error-handler.service';
import { AccountService } from './accounts/account.service';
import { CampaignPerformanceService } from './campaigns-performance/campaign-performance.service';
import { NgSelectModule } from '@ng-select/ng-select';

import { MessagesComponent }    from './messages/messages.component';
import { AccountsComponent } from './accounts/accounts.component';
import { AccountEditComponent } from './accounts/edit/account-edit.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { FundingPopupComponent } from './accounts/funding-popup/funding-popup.component';
import { CategoriesPopupComponent } from './categories-popup/categories-popup.component';
import { CampaignPerformanceComponent } from './campaigns-performance/campaigns-performance.component';
import { PubliherTargetingComponent } from './campaigns-performance/publiher-targeting/publiher-targeting.component';
import { DatetimeTargetingComponent } from './campaigns-performance/datetime-targeting/datetime-targeting.component';
import { AudienceTargetingComponent } from './campaigns-performance/audience-targeting/audience-targeting.component';
import { BlurDirective } from './blur.directive';
import { CampaignInfoComponent } from './campaigns-performance/campaign-info/campaign-info.component';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { RoleProvider } from './auth/role-provider';
import { TokenProvider } from './auth/token-provider';
import { NgxPermissionsModule } from 'ngx-permissions';
import { AdvertisersComponent } from './advertisers/advertisers.component';
import { AdvertiserService } from './advertisers/advertisers.service';
import { AdvertiserEditComponent } from './advertisers/advertiser-edit-popup/advertiser-edit.component';
import { ClientSelectorComponent } from './client-selector/client-selector.component';
import { ClientService } from './clients/client.service';
import { ExternalAudiencesComponent } from './audiences/audiences.component';
import { ProductSelectorComponent } from './product-selector/product-selector.component';
import { AudienceInfoComponent } from './audiences/audience-info/audience-info.component';
import { ClipboardModule } from 'ngx-clipboard';
import { EditAudienceComponent } from './audiences/newedit-modal/edit.component';
import { UploadAudienceComponent } from './audiences/upload-audience/upload-audience.component';
import { OrdersComponent } from './orders/orders.component';
import { IOService } from './orders/order.service';
import { OrderEditComponent } from './orders/order-edit-popup/order-edit.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { ProductsComponent } from './products/products.component';
import { ProductCreateModalComponent } from './products/product-create-modal/product-create-modal.component';
import { ProductConfigModalComponent } from './products/product-config-modal/product-config-modal.component';
import { ProductAddModalComponent } from './products/product-add-modal/product-add-modal.component';
import { EditCampaignComponent } from './campaigns/edit-campaign-modal/edit-campaign.component';
import { ImpressioncapComponent } from './caps-modal/impressioncap-modal/impressioncap.component';
import { ClickcapComponent } from './caps-modal/clickcap-modal/clickcap.component';
import { PlacementsComponent } from './placements/placements.component';
import { AdvertiserSelectorComponent } from './advertiser-selector/advertiser-selector.component';
import { PlacementEditComponent } from './placements/edit/placement-edit.component';
import { PartnersModalComponent } from './products/product-config-modal/partners-modal/partners-modal.component';
import { EventsModalComponent } from './products/events-modal/events-modal.component';
import { EventsPostbackModalComponent } from './products/events-modal/events-postback-modal/events-postback-modal.component';
import { ClientsComponent } from './clients/clients.component';
import { FundingModalComponent } from './clients/funding-modal/funding-modal.component';
import { PlacementCategoriesModalComponent } from './placements/edit/categories-modal/categories-modal.component';
import { ViewCampaignModalComponent } from './campaigns/view-campaign-modal/view-campaign-modal.component';
import { ViewPlacementComponent } from './placements/view-placement/view-placement.component';
import { ViewProductModalComponent } from './products/view-product-modal/view-product-modal.component';

export function tokenProviderFactory(provider: TokenProvider) {
  return () => provider.getToken();
}

export function rolesProviderFactory(provider: RoleProvider) {
  return () => provider.getRoles();
}

@NgModule({
  declarations: [
    AppComponent,
    AccountsComponent,
    AccountEditComponent,
    MessagesComponent,
    DashboardComponent,
    SpinnerComponent,
    FundingPopupComponent,
    CategoriesPopupComponent,
    CampaignPerformanceComponent,
    PubliherTargetingComponent,
    DatetimeTargetingComponent,
    AudienceTargetingComponent,
    BlurDirective,
    CampaignInfoComponent,
    CampaignsComponent,
    ExternalAudiencesComponent,
    ProductSelectorComponent,
    AudienceInfoComponent,
    EditAudienceComponent,
    UploadAudienceComponent,
    ConfirmModalComponent,
    AdvertisersComponent,
    AdvertiserEditComponent,
    ClientSelectorComponent,
    OrdersComponent,
    OrderEditComponent,
    ConfirmModalComponent,
    ProductsComponent,
    ProductCreateModalComponent,
    ProductConfigModalComponent,
    ProductAddModalComponent,
    EditCampaignComponent,
    ImpressioncapComponent,
    ClickcapComponent,
    PlacementsComponent,
    AdvertiserSelectorComponent,
    PlacementEditComponent,
    PartnersModalComponent,
    EventsModalComponent,
    EventsPostbackModalComponent,
    ClientsComponent,
    FundingModalComponent,
    PlacementCategoriesModalComponent,
    ViewCampaignModalComponent,
    ViewPlacementComponent,
    ViewProductModalComponent
  ],
  entryComponents: [
    FundingPopupComponent,
    MessagesComponent,
    CategoriesPopupComponent,
    PubliherTargetingComponent,
    DatetimeTargetingComponent,
    AudienceTargetingComponent,
    CampaignInfoComponent,
    AdvertiserEditComponent,
    OrderEditComponent,
    AudienceInfoComponent,
    EditAudienceComponent,
    UploadAudienceComponent,
    ConfirmModalComponent,
    ProductCreateModalComponent,
    ProductConfigModalComponent,
    ProductAddModalComponent,
    EditCampaignComponent,
    ImpressioncapComponent,
    ClickcapComponent,
    PlacementEditComponent,
    PartnersModalComponent,
    EventsModalComponent,
    EventsPostbackModalComponent,
    FundingModalComponent,
    PlacementCategoriesModalComponent,
    ViewCampaignModalComponent,
    ViewProductModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgSelectModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxMatDrpModule,
    ReactiveFormsModule,
    MyMaterialModule,
    NgxPermissionsModule.forRoot(),
    ClipboardModule
  ],
  providers: [
    AuthService,
    HttpErrorHandler,
    AccountService,
    CampaignPerformanceService,
    AdvertiserService,
    ClientService,
    httpInterceptorProviders,
    TokenProvider,
    RoleProvider,
    IOService,
    { provide: APP_INITIALIZER, useFactory: tokenProviderFactory, deps: [TokenProvider], multi: true },
    { provide: APP_INITIALIZER, useFactory: rolesProviderFactory, deps: [RoleProvider], multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
