import {Component, OnInit} from '@angular/core';
import {AngularFire} from "angularfire2";
import {Observable} from "rxjs";
import {isNullOrUndefined} from "util";

@Component({
    selector: 'app-player-screen',
    templateUrl: './player-screen.component.html',
    styleUrls: ['./player-screen.component.css']
})
export class PlayerScreenComponent implements OnInit {

    public place: Observable<number>;
    public money: Observable<number>;
    public isGameInProgress: Observable<boolean>;
    public question: Observable<any>;

    private uid: String;
    private questionKey: String;
    private month: Date;

    constructor(private af: AngularFire) {
        this.question = af.database.list('/questions', {
            query: {
                orderByKey: true,
                limitToLast: 1
            }
        }).filter(questions => questions.length > 0).map(questions => questions[0]);

        this.question.subscribe(question => {
            this.questionKey = question.$key;
        });

        let uid = af.auth.map(state => state.auth.uid);

        uid.subscribe(uid => this.uid = uid);

        let submissions: Observable<any[]> = this.question.flatMap(question => {
            return af.database.list(`/submissionsByQuestion/${question.$key}`, {
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

        this.month = new Date();
        this.month.setDate(1);
        this.month.setHours(0);
        this.month.setMinutes(0);

        let query = {
            query: {
                orderByKey: true,
                startAt: `${this.month.getTime()}`
            }
        };

        let answers = uid.flatMap(uid => af.database.list(`/answersByUser/${uid}`, query));
        let questions = af.database.list(`/questions`, query);

        this.money = Observable.combineLatest(answers, questions, (answers, questions) => {
            let total: number = 0;
            let questionValueMap: Map<string,number> = new Map<string,number>();

            questions.forEach(question => questionValueMap.set(question.$key, question.value));
            answers.forEach(answer => total += (questionValueMap.get(answer.$key) * (answer.correct === true ? 1 : -1)));

            return total;
        });

        this.isGameInProgress = af.database.object('/isGameInProgress').map(object => object.$value);
    }

    ngOnInit() {
    }

    onClick() {
        let payload = {submitted_on: new Date().getTime()};

        let submissionByUser = this.af.database.object(`/submissionsByUser/${this.uid}/${this.questionKey}`);
        let submissionByQuestion = this.af.database.object(`/submissionsByQuestion/${this.questionKey}/${this.uid}`);

        submissionByUser.set(payload);
        submissionByQuestion.set(payload);
    }

    getColor(money: number) {
        if (isNullOrUndefined(money) || money >= 0) {
            return "white";
        }
        else {
            return "#ff4d4d";
        }
    }
}
