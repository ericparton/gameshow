import {Component, OnInit} from '@angular/core';
import {AngularFire, FirebaseListObservable} from "angularfire2";
import {Observable} from "rxjs";

@Component({
    selector: 'app-player-screen',
    templateUrl: './player-screen.component.html',
    styleUrls: ['./player-screen.component.css']
})
export class PlayerScreenComponent implements OnInit {

    public submissions: FirebaseListObservable<any[]>;
    public questions: FirebaseListObservable<any[]>;
    public place: Observable<number>;
    public name: Observable<string>;

    constructor(private af: AngularFire) {
        this.questions = af.database.list('/questions', {
            query: {
                orderByKey: true,
                limitToLast: 1
            }
        });

        this.submissions = af.database.list('/submissions', {
            query: {
                orderByChild: 'submitted_on',
                startAt: this.questions
                    .filter(questions => questions.length === 1)
                    .map(questions => parseInt(questions[0].$key))
            }
        });

        this.place = Observable.combineLatest(this.submissions, this.af.auth).map(result => {
            let submissionz: any[] = result[0];
            let uid: string = result[1].auth.uid;

            for (let _i = 0; _i < submissionz.length; _i++) {
                if (submissionz[_i].$key === uid) {
                    return _i + 1;
                }
            }

            return null;
        });

        this.name = af.auth
            .map(state => state.auth.uid)
            .flatMap(uid => af.database.object(`/users/${uid}`))
            .map(user => {
                return user.name
            });
    }

    ngOnInit() {
    }
}
