import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'ordinal'})
export class OrdinalPipe implements PipeTransform {

    private special: string[] = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth',
        'ninth', 'tenth', 'eleventh', 'twelvth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth',
        'eighteenth', 'nineteenth'];

    private deca: string[] = ['twent', 'thirt', 'fourt', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

    transform(value: number): string {
        if (value < 20) {
            return this.special[value];
        }
        else if (value % 10 === 0) {
            return this.deca[Math.floor(value / 10) - 2] + 'ieth';
        }
        else {
            return this.deca[Math.floor(value / 10) - 2] + 'y-' + this.special[value % 10];
        }
    }
}
