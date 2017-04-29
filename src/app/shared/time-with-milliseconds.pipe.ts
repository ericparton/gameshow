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

        let time: string = datePipe.transform(value, 'jms');

        let parts = time.split(" ");
        return`${parts[0]}.${this.pad(numValue % 1000, 3)} ${parts[1]}`;
    }

    private pad(value, length) {
        return (value.toString().length < length) ? this.pad("0" + value, length) : value;
    }
}
