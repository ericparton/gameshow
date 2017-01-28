import {Component, OnInit} from '@angular/core';
import {AngularFire} from "angularfire2";
import {Observable} from "rxjs";

@Component({
    selector: 'app-player-screen',
    templateUrl: './player-screen.component.html',
    styleUrls: ['./player-screen.component.css']
})
export class PlayerScreenComponent implements OnInit {

    public place: Observable<number>;
    public name: Observable<string>;
    public money: Observable<number>;

    public uid: String;
    public question: String;

    constructor(private af: AngularFire) {
        let question = af.database.list('/questions', {
            query: {
                orderByKey: true,
                limitToLast: 1
            }
        }).filter(questions => questions.length > 0).map(questions => questions[0].$key);

        question.subscribe(question => {
            this.question = question;
        });

        af.auth.subscribe(state => {
            this.uid = state.auth.uid;
        });

        let submissions: Observable<any[]> = question.flatMap(question => {
            console.log(question);
            return af.database.list(`/submissions/${question}`, {
                query: {
                    orderByChild: 'submitted_on'
                }
            });
        });

        this.place = Observable.combineLatest(submissions, af.auth).map(result => {
            let submissions: any[] = result[0];
            let uid: string = result[1].auth.uid;

            for (let _i = 0; _i < submissions.length; _i++) {
                if (submissions[_i].$key === uid) {
                    return _i + 1;
                }
            }

            return -1;
        });

        this.name = af.auth
            .map(state => state.auth.uid)
            .flatMap(uid => af.database.object(`/users/${uid}`))
            .map(user => user.name);

        // this.money = af.auth
        //     .map(state => state.auth.uid)
        //     .flatMap(uid => af.database.object(`/users/${uid}`))
        //     .map(user => user.name);

        this.place.subscribe(place => console.log(place));
    }

    ngOnInit() {
    }

    onClick() {
        let now: number = new Date().getTime();
        this.af.database.object(`/submissions/${this.question}/${this.uid}`).set({
            submitted_on: now
        });
        this.af.database.object(`/users/${this.uid}/submissions/${this.question}`).set(true);
    }
}
