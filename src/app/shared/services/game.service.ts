import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class GameService {

    private inProgress : Observable<boolean>;

    constructor(private db: AngularFireDatabase) {
        this.inProgress = db.object('/isGameInProgress').map(object => object.$value);
    }

    public isGameInProgress(): Observable<boolean>
    {
        return this.inProgress;
    }

    public startGame(): void
    {
        this.db.object('/isGameInProgress').set(true);
    }

    public stopGame(): void
    {
        this.db.object('/isGameInProgress').set(false);
    }
}
