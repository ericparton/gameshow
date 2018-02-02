import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable()
export class UserService {

    private users: Observable<any>;
    private currentUserId: Observable<string>;

    constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {
        this.users = this.db.object('/users');
        this.currentUserId = this.auth.authState.map(state => state.uid);
    }

    public getUsers(): Observable<any> {
        return this.users;
    }

    public getCurrentUserId(): Observable<string> {
        return this.currentUserId;
    }
}
