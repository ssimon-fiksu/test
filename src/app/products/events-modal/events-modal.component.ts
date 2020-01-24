import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import { MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {Observable} from 'rxjs';
import {map, startWith, tap} from 'rxjs/operators';
import { MyErrorStateMatcher } from '../../error-state-mather';
import { ApiAnswer } from '../../api-answer';

import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from '../../auth/auth.service';

import { TrackingService } from '../../tracking.service';
import { EventsPostbackModalComponent } from './events-postback-modal/events-postback-modal.component';

export class Event {
  event_purpose: string
  id: string
  is_receiving: boolean
  name: string
}


@Component({
  selector: 'app-events-modal',
  templateUrl: './events-modal.component.html',
  styleUrls: ['./events-modal.component.less']
})
export class EventsModalComponent implements OnInit {

  loading = false;
  saving = false;
  view = false;
  purposeView = false;
  dataSource = new MatTableDataSource<any>();
  events: Event[] = [];
  displayedColumns: string[] = ["name", "is_receiving", "event_purpose", "actions"];

  constructor(public dialogRef: MatDialogRef<EventsModalComponent>,
    private permissionsService: NgxPermissionsService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private trackingService: TrackingService) { }

  @ViewChild(MatSort, {static: false}) sort: MatSort;

  ngOnInit() {
    this.permissionsService.loadPermissions(this.authService.userRoles);
    if(!this.permissionsService.getPermission('events setup')) {
      this.view = true;
    }
    if(!this.permissionsService.getPermission('event purpose setup')) {
      if(this.permissionsService.getPermission('event purpose viewer')) {
        this.purposeView = true;
      } else {
        this.displayedColumns.splice(2, 1);
      }
    }
    
    this.getEvents();
  }

  getEvents() {
    this.loading = true;
    this.trackingService.getEvents(this.data.pRef)
    .subscribe((data: ApiAnswer) => {
      if(data.data && Array.isArray(data.data)) {
        this.events = data.data;
        this.dataSource = new MatTableDataSource(this.events);
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch(property) {
            case 'name': return item.name.toLowerCase();
            default: return item[property];
          }
        };
        setTimeout(() => { this.dataSource.sort = this.sort; });
      }
      this.loading = false;
    });
  }

  getPostBack(event: Event) {
    const dialogRef = this.dialog.open(EventsPostbackModalComponent, {
      width: '700px',
      minHeight: '200px',
      data: {"id": event.id, "pRef": this.data.pRef, "name": event.name}
    });
  }

  confirm() {
    this.saving = true;
    this.trackingService.updateEvents(this.data.pRef, this.events)
     .subscribe((data: ApiAnswer) => {
        this.saving = false;
        if(data.success) this.dialogRef.close(data.success);
    });
  }

}
