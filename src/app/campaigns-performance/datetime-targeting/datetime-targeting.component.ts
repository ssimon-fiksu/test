import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { AccountService } from '../../accounts/account.service';
import { ApiAnswer } from '../../api-answer';

export class DateTimeTargeting {
  id: string;
  targets: [any[]];
  timezone: number;
}

@Component({
  selector: 'app-datetime-targeting',
  templateUrl: './datetime-targeting.component.html',
  styleUrls: ['./datetime-targeting.component.less']
})
export class DatetimeTargetingComponent {

  loading = false;
  hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  daysNum = {'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Staurday': 6, 'Sunday': 7};
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Staurday', 'Sunday'];
  timeZones = [-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11];
  daytimeTarget = {};
  isHourOnObj = {};

  constructor(public dialogRef: MatDialogRef<DatetimeTargetingComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: DateTimeTargeting,
    private accountService: AccountService) {
    this.daytimeTarget = JSON.parse(JSON.stringify( data.targets ));
    if(Array.isArray(this.daytimeTarget)) this.daytimeTarget = {};
    for (var hour = this.hours.length - 1; hour >= 0; hour--) {
      this.isHourOn(hour)
    }
  }

  markHour(day, hour) {
    let cell = this.daytimeTarget[this.daysNum[day]];
    if(cell == undefined) {
      cell = [];
      this.daytimeTarget[this.daysNum[day]] = cell;
    }
    let isOn = cell.indexOf(hour);
    if(isOn == -1) {
      cell.push(hour);
    } else {
      cell.splice(isOn, 1);
    }
    this.isHourOn(hour);
  }

  markDays(day, isOn) {
    this.daytimeTarget[this.daysNum[day]] = isOn ? [] : Object.assign([], this.hours);
    for (var hour = this.hours.length - 1; hour >= 0; hour--) {
      this.isHourOn(hour)
    }
  }

  markHours(hour) {
    this.days.forEach((day) => {
      let value = this.daytimeTarget[this.daysNum[day]];
      if(this.isHourOnObj[hour]) {
        value.splice(value.indexOf(hour), 1);
      } else {
        if(value == undefined) {
          value = [];
          this.daytimeTarget[this.daysNum[day]] = value;
        }
        value.indexOf(hour) == -1 && value.push(hour);
      }
    })
    this.isHourOn(hour);
  }

  isHourOn(hour) {
    let isOn = [];
    Object.keys(this.daytimeTarget).forEach(key => {
      if(this.daytimeTarget[key].indexOf(hour) > -1) {
        isOn.push(hour);
      }
      this.daytimeTarget[key].sort((a, b) => a - b);
    });
    this.isHourOnObj[hour] = isOn.length == 7;
  }

  filterRows(day) {
    let row = this.daytimeTarget[this.daysNum[day]] || [];
    let dimension = [];
    let filteredRows = [];
    let time = [];
    if (row.length == 0) {
      return "N/A";
    } else if (row.length === 24) {
      return "00:00 - 24:00";
    } else {
      this.hours.map((hour) => {
        if (row.indexOf(hour) > -1) {
          time.push(hour);
        } else {
          dimension.push(time);
          time = [];
        }
      });
      dimension.push(time);
      filteredRows = dimension.filter(item => {
        return item.length !== 0;
      });
      return this.renderDescription(filteredRows);
    }
  }

  renderDescription(filteredRows) {
    let that = this;
    let description = [];
    filteredRows.forEach(function(f) {
      if (f.length === 1) {
        description.push(that.correctNumber(f[0]) + " - " + that.correctNumber(f[0] + 1));
      } else {
        description.push(that.correctNumber(f[0]) + " - " + that.correctNumber(f[f.length - 1] + 1));
      }
    });
    return description.join(', ');
  }

  correctNumber(number) {
    if (number < 10) {
      return "0" + number +":00";
    } else {
      return number + ":00";
    }
  }

  save() {
    let data = {
      "account_day_hour": this.daytimeTarget,
      "offset": this.data.timezone
    }
    this.loading = true;
    this.accountService.updateDateTime(this.data.id, data)
      .subscribe((data: ApiAnswer) => {
        this.loading = false;
        if(data.success) this.dialogRef.close({
          "account_day_hour": this.daytimeTarget,
          "offset": this.data.timezone
        });
      });
  }

}
