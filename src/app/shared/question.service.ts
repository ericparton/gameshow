import {Injectable} from '@angular/core';
import {AngularFire} from "angularfire2";
import {Observable} from "rxjs";

@Injectable()
export class QuestionService {

    private latestQuestion: Observable<any>;

    constructor(private af: AngularFire) {
        this.latestQuestion = af.database.list('/questions', {
            query: {
                orderByKey: true,
                limitToLast: 1
            }
        }).filter(questions => questions.length > 0).map(questions => questions[0]);
    }

    public getLatestQuestion(): Observable<any> {
        return this.latestQuestion;
    }

    public createNewQuestion(value: number): void {
        let now: Date = new Date();

        this.af.database.object(`/questions/${now.getTime()}`).set({
            value: value
        });
    }

    public listQuestionsStartingAt(startDate: Date) {
        return this.af.database.list(`/questions`, {
                query: {
                    orderByKey: true,
                    startAt: `${startDate.getTime()}`
                }
            }
        );
    }

    public listQuestionsWithQuery(query: Observable<any>) {
        return query.flatMap(query => this.af.database.list('/questions', query));
    }
}
