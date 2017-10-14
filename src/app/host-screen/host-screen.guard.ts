import {CanActivate} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable()
export class HostRouteGuard implements CanActivate {

    constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {
    }

    canActivate() {
        return Observable.combineLatest(this.auth.authState, this.db.object(`/hosts`), (auth, hosts) => {
            return hosts[`${auth.uid}`] === true;
        });
    }
}