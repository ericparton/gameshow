import {CanActivate} from '@angular/router';
import {Injectable} from '@angular/core';
import {AngularFire} from "angularfire2";
import {Observable} from "rxjs";

@Injectable()
export class HostRouteGuard implements CanActivate {

    constructor(private af: AngularFire) {
    }

    canActivate() {
        return Observable.combineLatest(this.af.auth, this.af.database.object(`/hosts`), (auth, hosts) => {
            return hosts[`${auth.uid}`] === true;
        });
    }
}