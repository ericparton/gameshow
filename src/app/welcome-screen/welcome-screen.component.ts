import {Component, OnInit} from '@angular/core';
import {WakeLockService} from "../shared/services/wake-lock.service";
import {Router} from "@angular/router";

declare var NoSleep: any;

@Component({
    selector: 'app-welcome-screen',
    templateUrl: './welcome-screen.component.html',
    styleUrls: ['./welcome-screen.component.css']
})
export class WelcomeScreenComponent implements OnInit {

    public noSleep: any;

    constructor(private wakeLockService: WakeLockService, private router: Router) {
        this.noSleep = new NoSleep();
    }

    ngOnInit() {
        let _this = this;

        document.querySelector("#startButton").addEventListener('click', function () {
            _this.noSleep.enable();
            _this.wakeLockService.setWakeLockEnabled(true);
            _this.router.navigate(['/game']);
        }, false);
    }
}
