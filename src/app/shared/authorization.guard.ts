import {combineLatest as observableCombineLatest, Observable, pipe} from 'rxjs';
import {CanActivate} from '@angular/router';
import {Injectable} from '@angular/core';
import {AngularFireDatabase} from "@angular/fire/database";
import {AngularFireAuth} from "@angular/fire/auth";
import * as firebase from "firebase";
import {isNullOrUndefined} from "util";
import {map} from "rxjs/operators";

@Injectable()
export class AuthorizationGuard implements CanActivate {

    constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {}

    canActivate(): Observable<boolean> {
        return this.auth.authState.pipe(
            map(state => {
                if (isNullOrUndefined(state)) {
                    this.auth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
                    return false;
                } else {
                    return true;
                }
            })
        );
    }
}
