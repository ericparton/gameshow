import {CanActivate, Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {WakeLockService} from "./services/wake-lock.service";

@Injectable()
export class WakeLockGuard implements CanActivate {

    constructor(private wakeLockService: WakeLockService, private router: Router) {}

    canActivate() {
        if (this.wakeLockService.isWakeLockEnabled()) {
            return true;
        } else {
            return this.router.parseUrl('/welcome');
        }
    }
}
