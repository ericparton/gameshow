import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from "@angular/common";

@Pipe({name: 'millisecondsDate'})
export class MillisecondDatePipe implements PipeTransform {
    transform(value: any): string {
        if(!value){
            return value;
        }

        let datePipe: DatePipe = new DatePipe('en-US');
        let numValue: number = parseInt(value);

        let date: string = datePipe.transform(value,);
        let time: string = datePipe.transform(value, 'jms');

        let parts = time.split(" ");
        return`${date} ${parts[0]}.${this.pad(numValue % 1000, 3)} ${parts[1]}`;
    }

    private pad(value, length) {
        return (value.toString().length < length) ? this.pad("0" + value, length) : value;
    }
}
