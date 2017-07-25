import { Injectable, Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'DateFormat'
})
@Injectable()
export class DateFormatPipe implements PipeTransform {
  // DateFormatPipe
  // Montrer moment.js dateFormat pour le temps écoulé.
  transform(date: any, args?: any): any {
    return moment(new Date(date)).fromNow();
  }
}
