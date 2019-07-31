import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe, formatDate} from "@angular/common";
import {MillisecondTimePipe} from "./time-with-milliseconds.pipe";

@Pipe({name: 'millisecondsDate'})
export class MillisecondDatePipe extends MillisecondTimePipe {
    transform(value: any): string {
        if(!value){
            return value;
        }

        let date: string = new DatePipe('en-US').transform(value);
        let time: string = super.transform(value);

        return`${date} ${time}`;
    }
}
