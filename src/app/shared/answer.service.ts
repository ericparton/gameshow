import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {isNullOrUndefined} from "util";
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';

@Injectable()
export class AnswerService {

    constructor(private db: AngularFireDatabase) {

    }

    public listAnswersByQuestionWithQuery(query: Observable<any>)
    {
        return query.flatMap(query => this.db.list('/answersByQuestion', query));
    }

    public getAnswersByUserStartingAt(userId: Observable<string>, startDate: Date) {
        let query = {
            query: {
                orderByKey: true,
                startAt: `${startDate.getTime()}`
            }
        };

        return userId.flatMap(userId => this.db.list(`/answersByUser/${userId}`, query));
    }

    public isAnswerCorrect(userId: Observable<string>, question: Observable<any>) {
        return Observable.combineLatest(question, userId)
            .flatMap(arr => this.db.object(`/answersByUser/${arr[1]}/${arr[0].$key}`))
            .map(answer => answer.correct);
    };

    public getAnswersByQuestion(question: Observable<any>): Observable<any> {
        return question.flatMap(question => {
            return this.db.list(`/answersByQuestion/${question.$key}`)
        });
    }

    public setAnswer(userId: string, questionId: string, isCorrect: boolean, wager: number = null) {
        let answer = {correct: isCorrect};

        if(!isNullOrUndefined(wager)){
            answer['wager'] = wager;
        }

        this.getAnswerDatabaseObjects(userId, questionId).forEach(answerDatabaseObject => {
            answerDatabaseObject.set(answer);
        });
    }

    public removeAnswer(userId: string, questionId: string) {
        this.getAnswerDatabaseObjects(userId, questionId).forEach(answerDatabaseObject => {
            answerDatabaseObject.remove();
        });
    }

    private getAnswerDatabaseObjects(userId: string, questionId: string): FirebaseObjectObservable<any>[] {
        return [
            this.db.object(`/answersByUser/${userId}/${questionId}`),
            this.db.object(`/answersByQuestion/${questionId}/${userId}`)
        ];
    }
}

