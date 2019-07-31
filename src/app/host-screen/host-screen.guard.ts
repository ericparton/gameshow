
import {combineLatest as observableCombineLatest, Observable} from 'rxjs';
import {CanActivate} from '@angular/router';
import {Injectable} from '@angular/core';
import {AngularFireDatabase} from "@angular/fire/database";
import {AngularFireAuth} from "@angular/fire/auth";

@Injectable()
export class HostRouteGuard implements CanActivate {

    constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {
    }

    canActivate() {
        return observableCombineLatest(this.auth.authState, this.db.object(`/hosts`).valueChanges(), (auth, hosts) => {
            return hosts[`${auth.uid}`] === true;
        });
    }
}
