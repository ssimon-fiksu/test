import { Component, OnInit } from '@angular/core';
import { ApiAnswer } from '../api-answer';
import { AdvertiserService } from '../advertisers/advertisers.service';
import { Advertiser } from '../advertisers/advertiser';

import { ClientService } from '../clients/client.service';
import { Client } from '../clients/client';

@Component({
  selector: 'app-advertiser-selector',
  templateUrl: './advertiser-selector.component.html',
  styleUrls: ['./advertiser-selector.component.less']
})
export class AdvertiserSelectorComponent implements OnInit {

  selectedAdv: Advertiser;
  advRef: string;
  loading = false;
  advsData: Advertiser[] = [];
  selectedClient: Client;

  constructor(
    private advService: AdvertiserService, 
    private clientService: ClientService) {
  }

  ngOnInit() {
    this.advRef = localStorage.getItem('adv_pub_id');
    this.loading = true;
    this.clientService.getSelectedClient
    .subscribe((client: Client) => {
      if(client && (!this.selectedClient || client.client_api_ref != this.selectedClient.client_api_ref)) {
        this.selectedClient = client;
        this.getAdvertisers();
      }
    })
  }

  advChanged() {
    if(this.selectedAdv)  { 
      this.advService.updateSelectedAdvertiser(this.selectedAdv);
      this.advRef = localStorage.getItem('adv_pub_id'); 
    }
  }

  getAdvertisers() {
    this.loading = true;
    this.advsData = [];
    return this.advService.getAdvertisers(this.selectedClient.client_api_ref)
      .subscribe((data: ApiAnswer) => {
        if(data.data && data.data.length > 0) {
          this.advsData = data.data;
          if(this.advRef) {
            this.selectedAdv = this.advsData.filter(adv => this.advRef == adv.public_identifier)[0];
            if(this.selectedAdv) this.advService.updateSelectedAdvertiser(this.selectedAdv);
            else this.advService.removeSelectedAdvertiser();
          }
        } else if(this.advRef) this.advService.removeSelectedAdvertiser();
        this.loading = false;
    });
  }

}
