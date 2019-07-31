
import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AngularFireDatabase} from "@angular/fire/database";
import {AngularFireAuth} from "@angular/fire/auth";
import {User} from "../data/user";

@Injectable()
export class UserService {

    private users: Observable<{string: User}>;
    private currentUserId: Observable<string>;

    constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {
        this.users = this.db.object<{string: User}>('/users').valueChanges();
        this.currentUserId = this.auth.authState.pipe(map(state => state.uid));
    }

    public getUsers(): Observable<{string: User}> {
        return this.users;
    }

    public getCurrentUserId(): Observable<string> {
        return this.currentUserId;
    }
}
