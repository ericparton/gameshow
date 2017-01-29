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

        let uid = af.auth.map(state => state.auth.uid);

        uid.subscribe(uid => this.uid = uid);

        let submissions: Observable<any[]> = question.flatMap(question => {
            return af.database.list(`/submissionsByQuestion/${question}`, {
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

        this.name = uid
            .flatMap(uid => af.database.object(`/users/${uid}`))
            .map(user => user.name);

        uid.flatMap(uid => {
            let date: Date = new Date();
            date.setDate(1);
            date.setHours(0);
            date.setMinutes(0);

            return af.database.list(`/answersByUser/${uid}`, {
                query: {
                    orderByKey: true,
                    startAt: `${date.getTime()}`
                }
            })
        }).subscribe(answers => {
            let bufferCount = answers.length;
            let keys = Observable.from(answers).map(answer => answer.$key);

            if (this.subscription) {
                this.subscription.unsubscribe();
            }

            this.subscription = keys.flatMap(key => af.database.object(`/questions/${key}`))
                .bufferCount(bufferCount)
                .do(questions => {
                    let sum: number = 0;
                    let answerMap: Map<string,boolean> = new Map<string,boolean>();

                    console.log(answers);

                    answers.forEach(answer => answerMap.set(answer.$key, answer.correct));

                    questions.forEach((question) => {
                        sum += (answerMap.get(question.$key) ? 1 : -1) * question.value;
                    });

                    this.money = sum;
                }).subscribe();
        });
    }

    ngOnInit() {
    }

    onClick() {
        let payload = {submitted_on: new Date().getTime()};

        let submissionByUser = this.af.database.object(`/submissionsByUser/${this.uid}/${this.question}`);
        let submissionByQuestion = this.af.database.object(`/submissionsByQuestion/${this.question}/${this.uid}`);

        submissionByUser.set(payload);
        submissionByQuestion.set(payload);
    }
}
