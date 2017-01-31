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

    private uid: String;
    private question: String;
    private month: Date;

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

    getColor(money: number) {
        if (isNullOrUndefined(money) || money >= 0) {
            return "black";
        }
        else {
            return "red";
        }
    }
}
