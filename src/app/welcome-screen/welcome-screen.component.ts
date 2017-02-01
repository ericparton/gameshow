import {Component, OnInit} from '@angular/core';

declare var NoSleep: any;

@Component({
    selector: 'app-welcome-screen',
    templateUrl: './welcome-screen.component.html',
    styleUrls: ['./welcome-screen.component.css']
})
export class WelcomeScreenComponent implements OnInit {

    public noSleep: any;

    constructor() {
        this.noSleep = new NoSleep();
    }

    ngOnInit() {
        let _this = this;

        document.querySelector("#startButton").addEventListener('click', function () {
            _this.noSleep.enable();
        }, false);
    }
}
