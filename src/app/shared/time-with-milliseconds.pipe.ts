import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from "@angular/common";

@Pipe({name: 'millisecondsTime'})
export class MillisecondTimePipe implements PipeTransform {
    transform(value: any): string {
        if(!value){
            return value;
        }

        let datePipe: DatePipe = new DatePipe('en-US');
        let numValue: number = parseInt(value);

        return datePipe.transform(value, 'h:mm:ss:SSS aaa');
    }
}
