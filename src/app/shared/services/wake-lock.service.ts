import {Injectable} from '@angular/core';

@Injectable()
export class WakeLockService {

    private wakeLockEnabled: boolean;

    constructor() {
        this.wakeLockEnabled = false;
    }

    public isWakeLockEnabled(): boolean {
        return this.wakeLockEnabled;
    }

    public setWakeLockEnabled(wakeLockEnabled: boolean): void {
        this.wakeLockEnabled = wakeLockEnabled;
    }
}
