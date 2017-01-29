import {Component, OnInit} from '@angular/core';
import {AngularFire} from "angularfire2";
import {Observable, Subscription} from "rxjs";

@Component({
    selector: 'app-player-screen',
    templateUrl: './player-screen.component.html',
    styleUrls: ['./player-screen.component.css']
})
export class PlayerScreenComponent implements OnInit {

    public place: Observable<number>;
    public name: Observable<string>;
    public money: number;

    public uid: String;
    public question: String;

    private subscription: Subscription;

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

        let uid = af.auth.map(state => state.auth.uid).do(uid => this.uid = uid);

        this.name = uid
            .flatMap(uid => af.database.object(`/users/${uid}`))
            .map(user => user.name);

        let keys = uid.flatMap(uid => af.database.list(`/users/${uid}/answers`));

        keys.subscribe(keys => {
            let bufferCount = keys.length;
            let sequentialKeys = Observable.from(keys).map(key => key.$key);

            if (this.subscription) {
                this.subscription.unsubscribe();
            }

            let answers = sequentialKeys
                .flatMap(key => af.database.object(`/answers/${key}`))
                .bufferCount(bufferCount);

            let questions = sequentialKeys
                .flatMap(key => af.database.object(`/questions/${key}`))
                .bufferCount(bufferCount);

            this.subscription = Observable.combineLatest(questions, answers, (s1, s2) => {
                let map: Map<string,boolean> = new Map<string,boolean>();
                let sum: number = 0;

                s2.forEach(s => map.set(s.$key, s[`${this.uid}`].correct));

                s1.forEach((s) => {
                    sum += (map.get(s.$key) ? 1 : -1) * s.value;
                });

                this.money = sum;
            }).subscribe();
        })
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
