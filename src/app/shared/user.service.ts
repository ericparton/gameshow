import {Injectable} from '@angular/core';
import {AngularFire} from "angularfire2";
import {Observable} from "rxjs";

@Injectable()
export class UserService {

    private users: Observable<any>;
    private currentUserId: Observable<string>;

    constructor(private af: AngularFire) {
        this.users = this.af.database.object('/users');
        this.currentUserId = this.af.auth.map(state => state.auth.uid);
    }

    public getUsers() {
        return this.users;
    }

    public getCurrentUserId() {
        return this.currentUserId;
    }
}
