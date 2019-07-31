
import {combineLatest as observableCombineLatest, Observable} from 'rxjs';

import {map, mergeMap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {isNullOrUndefined} from "util";
import {Answer} from "../data/answer";
import {AngularFireDatabase, AngularFireObject} from "@angular/fire/database";
import {Question} from "../data/question";

@Injectable()
export class AnswerService {

    constructor(private db: AngularFireDatabase) {}

    public listAnswersByQuestionWithinDateRange(dateRange: Observable<Date[]>): Observable<Answer[]> {
        return dateRange.pipe(
            mergeMap(dateRange => {
                return this.db.list<Answer>('/answersByQuestion', ref => {
                    return ref.orderByKey().startAt(`${dateRange[0].valueOf()}`).endAt(`${dateRange[1].valueOf()}`);
                }).valueChanges();
            })
        );
    }

    public getAnswersByUserStartingAt(userId: Observable<string>, startDate: Date): Observable<Answer[]> {
        return userId.pipe(
            mergeMap(userId => {
                return this.db.list<Answer>(`/answersByUser/${userId}`, ref => {
                    return ref.orderByKey().startAt(`${startDate.getTime()}`);
                }).valueChanges()
            })
        );
    }

    public getAnswerByUserAndQuestion(userId: Observable<string>, question: Observable<Question>): Observable<Answer|null> {
        return observableCombineLatest([question, userId]).pipe(
            mergeMap(arr => this.db.object<Answer>(`/answersByUser/${arr[1]}/${arr[0].key}`).valueChanges()),
        );
    };

    public getAnswersByQuestion(question: Observable<Question>): Observable<Answer[]> {
        return question.pipe(
            mergeMap(question => {
                return this.db.list<Answer>(`/answersByQuestion/${question.key}`).valueChanges()
            })
        );
    }

    public setAnswer(userId: string, questionId: string, isCorrect: boolean, wager: number = null): void {
        let answer = {
            user: userId,
            question: questionId,
            correct: isCorrect
        };

        if (!isNullOrUndefined(wager)) {
            answer['wager'] = wager;
        }

        this.getAnswerDatabaseObjects(userId, questionId).forEach(answerDatabaseObject => {
            answerDatabaseObject.set(answer);
        });
    }

    public removeAnswer(userId: string, questionId: string): void {
        this.getAnswerDatabaseObjects(userId, questionId).forEach(answerDatabaseObject => {
            answerDatabaseObject.remove();
        });
    }

    private getAnswerDatabaseObjects(userId: string, questionId: string): AngularFireObject<Answer>[] {
        return [
            this.db.object(`/answersByUser/${userId}/${questionId}`),
            this.db.object(`/answersByQuestion/${questionId}/${userId}`)
        ];
    }
}

