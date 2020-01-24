import { Component, OnInit } from '@angular/core';
import { ApiAnswer } from '../api-answer';
import { ClientService } from '../clients/client.service';
import { Client } from '../clients/client';
import { AdvertiserService } from '../advertisers/advertisers.service';
import { Advertiser } from '../advertisers/advertiser';

@Component({
  selector: 'app-client-selector',
  templateUrl: './client-selector.component.html',
  styleUrls: ['./client-selector.component.less']
})
export class ClientSelectorComponent implements OnInit {

  selectedClient: Client;
  clientRef: string;
  loading = false;
  clientsData: Client[] = [];

  constructor(
    private clientService: ClientService,
    private advService: AdvertiserService) {
  }

  ngOnInit() {
    this.clientRef = localStorage.getItem('client_ref');
    this.getClients();
  }

  _filterStates(value: any): object[] {
    if(!value) return [];
    let name = value.name || value;
    return this.clientsData.filter(client => (client.name).toLowerCase().indexOf(name.toLowerCase()) > -1);
  }

  clientChanged() {
    this.clientService.updateSelectedClient(this.selectedClient);
  }

  displayClient(a: object) {
    return a ? a['name'] : '';
  }

  getClients() {
    this.loading = true;
    return this.clientService.getClients(false)
      .subscribe((data: ApiAnswer) => {
        this.clientsData = data.data;
        if(this.clientRef) {
          this.selectedClient = this.clientsData.filter(client => this.clientRef == client.client_api_ref)[0] || this.clientsData[0];
        } else {
          this.selectedClient = this.clientsData[0];
        }
        this.clientService.updateSelectedClient(this.selectedClient);
        this.loading = false;
    });
  }

}
