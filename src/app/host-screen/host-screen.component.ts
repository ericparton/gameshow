import {Component, OnInit} from '@angular/core';
import {AngularFire, FirebaseObjectObservable} from "angularfire2";
import {Observable} from "rxjs";
import {isNullOrUndefined} from "util";

@Component({
    selector: 'app-host-screen',
    templateUrl: './host-screen.component.html',
    styleUrls: ['./host-screen.component.css']
})
export class HostScreenComponent implements OnInit {

    public responses: Observable<any[]>;
    public users: Observable<any>;
    public isGameInProgress: Observable<boolean>;

    public question: any;
    public valueModel: number;
    public answerModel: string[] = [];
    public gameStartedModel: boolean = false;

    constructor(private af: AngularFire) {
        this.users = af.database.object('/users');

        this.isGameInProgress = af.database.object('/isGameInProgress').map(object => object.$value);
        this.isGameInProgress.subscribe(isGameInProgress => this.gameStartedModel = isGameInProgress);

        let question = af.database.list('/questions', {
            query: {
                orderByKey: true,
                limitToLast: 1
            }
        }).filter(questions => questions.length > 0).map(questions => questions[0]);

        question.subscribe(q => this.question = q);

        let submissions = question
            .flatMap(question => {
                return af.database.list(`/submissionsByQuestion/${question.$key}`, {
                    query: {
                        orderByChild: 'submitted_on'
                    }
                });
            });

        let answers = question.flatMap(question => {
            return af.database.list(`/answersByQuestion/${question.$key}`)
        });

        this.responses = Observable.combineLatest(submissions, answers, (s1, s2) => {
            let map: Map<string,boolean> = new Map<string,boolean>();
            this.answerModel = [];

            s2.forEach(s => map.set(s.$key, s.correct));

            s1.forEach((s, i) => {
                if (map.has(s.$key)) {
                    this.answerModel[i] = `${map.get(s.$key)}`;
                }
            });

            return s1;
        });
    }

    ngOnInit() {
    }

    getUser(users: any, uid: string): any {
        if (users) {
            return users[uid];
        }

        return null
    }

    onNewQuestionSubmit() {
        let now: Date = new Date();

        this.af.database.object(`/questions/${now.getTime()}`).set({
            value: this.valueModel
        });

        this.valueModel = null;
    }

    onGameStartedChange(gameStarted: boolean) {
        this.af.database.object('/isGameInProgress').set(gameStarted);
    }

    onAnswerStateChange(uid: string, event: string) {
        let answerByUser = this.af.database.object(`/answersByUser/${uid}/${this.question.$key}`);
        let answerByQuestion = this.af.database.object(`/answersByQuestion/${this.question.$key}/${uid}`);

        this.setAnswer(event, answerByUser);
        this.setAnswer(event, answerByQuestion);
    }

    private setAnswer(correct: string, answer: FirebaseObjectObservable<any>) {
        if (!isNullOrUndefined(correct)) {
            let value = correct.trim().toLowerCase() === 'true';
            answer.set({correct: value});
        }
        else {
            answer.remove();
        }
    }
}
