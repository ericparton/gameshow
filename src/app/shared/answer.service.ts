import {Injectable} from '@angular/core';
import {AngularFire, FirebaseObjectObservable} from "angularfire2";
import {Observable} from "rxjs";

@Injectable()
export class AnswerService {

    constructor(private af: AngularFire) {

    }

    public listAnswersByQuestionWithQuery(query: Observable<any>)
    {
        return query.flatMap(query => this.af.database.list('/answersByQuestion', query));
    }

    public getAnswersByUserStartingAt(userId: Observable<string>, startDate: Date) {
        let query = {
            query: {
                orderByKey: true,
                startAt: `${startDate.getTime()}`
            }
        };

        return userId.flatMap(userId => this.af.database.list(`/answersByUser/${userId}`, query));
    }

    public isAnswerCorrect(userId: Observable<string>, question: Observable<any>) {
        return Observable.combineLatest(question, userId)
            .flatMap(arr => this.af.database.object(`/answersByUser/${arr[1]}/${arr[0].$key}`))
            .map(answer => answer.correct);
    };

    public getAnswersByQuestion(question: Observable<any>): Observable<any> {
        return question.flatMap(question => {
            return this.af.database.list(`/answersByQuestion/${question.$key}`)
        });
    }

    public setAnswer(userId: string, questionId: string, isCorrect: boolean) {
        this.getAnswerDatabaseObjects(userId, questionId).forEach(answerDatabaseObject => {
            answerDatabaseObject.set({correct: isCorrect});
        });
    }

    public removeAnswer(userId: string, questionId: string) {
        this.getAnswerDatabaseObjects(userId, questionId).forEach(answerDatabaseObject => {
            answerDatabaseObject.remove();
        });
    }

    private getAnswerDatabaseObjects(userId: string, questionId: string): FirebaseObjectObservable<any>[] {
        return [
            this.af.database.object(`/answersByUser/${userId}/${questionId}`),
            this.af.database.object(`/answersByQuestion/${questionId}/${userId}`)
        ];
    }
}

