import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AngularFireDatabase} from "@angular/fire/database";

@Injectable()
export class GameService {

    private inProgress : Observable<boolean>;

    constructor(private db: AngularFireDatabase) {
        this.inProgress = db.object<boolean>('/isGameInProgress').valueChanges();
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
