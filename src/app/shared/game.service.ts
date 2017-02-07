import {Injectable} from '@angular/core';
import {AngularFire} from "angularfire2";
import {Observable} from "rxjs";

@Injectable()
export class GameService {

    private inProgress : Observable<boolean>;

    constructor(private af: AngularFire) {
        this.inProgress = af.database.object('/isGameInProgress').map(object => object.$value);
    }

    public isGameInProgress()
    {
        return this.inProgress;
    }

    public startGame()
    {
        this.af.database.object('/isGameInProgress').set(true);
    }

    public stopGame()
    {
        this.af.database.object('/isGameInProgress').set(false);
    }
}
