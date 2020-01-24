import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountsComponent }      from './accounts/accounts.component';
import { DashboardComponent }   from './dashboard/dashboard.component';
import { AccountEditComponent }  from './accounts/edit/account-edit.component';
import { CampaignPerformanceComponent } from './campaigns-performance/campaigns-performance.component';
import { AuthGuard } from './auth/auth.guard';
import { OrdersComponent } from './orders/orders.component';
import { AdvertisersComponent } from './advertisers/advertisers.component';
import { ExternalAudiencesComponent } from './audiences/audiences.component';
import { ProductsComponent } from './products/products.component';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { PlacementsComponent } from './placements/placements.component';
import { PlacementEditComponent } from './placements/edit/placement-edit.component';
import { ClientsComponent } from './clients/clients.component';
import { ViewPlacementComponent } from './placements/view-placement/view-placement.component';

const routes: Routes = [
  { path: '', redirectTo: 'accounts', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'accounts', component: AccountsComponent, canActivate: [AuthGuard], data: { roles: ["account list performance"] }  },
  { path: 'account/edit/:id', component: AccountEditComponent, canActivate: [AuthGuard], data: { roles: ["account editor"] }  },
  { path: 'account/new', component: AccountEditComponent, canActivate: [AuthGuard], data: { roles: ["account creator"] }  },
  { path: 'campaign-performance/:accid', component: CampaignPerformanceComponent, canActivate: [AuthGuard], data: { roles: ["campaign list performance"] } },
  { path: 'audiences', component: ExternalAudiencesComponent, canActivate: [AuthGuard], data: { roles: ["external audience list"] } },
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard], data: { roles: ["insertion order list"] } },  
  { path: 'advertisers', component: AdvertisersComponent, canActivate: [AuthGuard], data: { roles: ["advertiser list"] }  },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard], data: { roles: ["advertiser applications list"] }  },
  { path: 'campaigns', component: CampaignsComponent, canActivate: [AuthGuard], data: { roles: ["campaign list performance"] }  },
  { path: 'placements', component: PlacementsComponent, canActivate: [AuthGuard], data: { roles: ["placements list"] }  },
  { path: 'placement/edit/:id', component: PlacementEditComponent, canActivate: [AuthGuard], data: { roles: ["placement editor"] }  },
  { path: 'placement/new/:camp', component: PlacementEditComponent, canActivate: [AuthGuard], data: { roles: ["placement creator"] }  },
  { path: 'placement/view/:id', component: ViewPlacementComponent, canActivate: [AuthGuard], data: { roles: ["placement viewer"] }  },
  { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard], data: { roles: ["client list"] }  },
  { path: '**', redirectTo: 'accounts', pathMatch: 'full'},
];


@NgModule({
  exports: [ RouterModule ],
  imports: [ RouterModule.forRoot(routes) ]
})

export class AppRoutingModule { }
