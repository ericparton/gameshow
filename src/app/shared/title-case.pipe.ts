import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'titlecase'})
export class TitleCasePipe implements PipeTransform {
    public transform(input: string): string {
        if (!input) {
            return '';
        } else {
            let names = [];

            input.split(' ')
                .map(name => name.trim())
                .forEach(name => {
                    names.push(name.charAt(0).toUpperCase() + name.slice(1));
                });

            return names.join(' ');
        }
    }
}