
import {combineLatest as observableCombineLatest, of as observableOf, Observable} from 'rxjs';

import {filter, mergeMap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {isNullOrUndefined} from "util";
import {Question} from "../data/question";
import {Submission} from "../data/submission";
import {AngularFireDatabase, AngularFireObject} from "@angular/fire/database";

@Injectable()
export class SubmissionService {

    constructor(private db: AngularFireDatabase) {}

    public getSubmissionsByQuestion(question: Observable<Question> | Question): Observable<Submission[]> {
        let questionObservable: Observable<Question>;

        if (question instanceof Observable) {
            questionObservable = question;
        }
        else {
            questionObservable = observableOf(question);
        }

        return questionObservable.pipe(mergeMap(question => {
                return this.db.list<Submission>(
                    `/submissionsByQuestion/${question.key}`,
                    ref => ref.orderByChild('submitted_on')
                ).valueChanges();
            }
        ));
    }

    public getSubmissionByUserAndQuestion(userId: Observable<string>, question: Observable<Question>): Observable<Submission> {
        return observableCombineLatest([userId, question]).pipe(
            mergeMap(arr => {
                return this.db.object<Submission>(`/submissionsByUser/${arr[0]}/${arr[1].key}`).valueChanges()
            })
        );
    }

    public createSubmission(userId: string, questionId: string, wager: number = null): void {
        let now = {".sv": "timestamp"};
        // let now = new Date().getTime();

        let submission: Submission = {
            question: questionId,
            submitted_on: now,
            user: userId
        };

        if (!isNullOrUndefined(wager)) {
            submission.wager = wager;
        }

        this.getSubmissionDatabaseObjects(userId, questionId).forEach(submissionDatabaseObject => {
            submissionDatabaseObject.set(submission)
        });
    }

    public removeSubmission(userId: string, questionId: string): void {
        this.getSubmissionDatabaseObjects(userId, questionId).forEach(submissionDatabaseObject => {
            submissionDatabaseObject.remove();
        });
    }

    public setSubmissionText(userId: string, questionId: string, text: string): void {
        this.getSubmissionDatabaseObjects(userId, questionId).forEach(submissionDatabaseObject => {
            submissionDatabaseObject.update({text: text})
        });
    }

    private getSubmissionDatabaseObjects(userId: string, questionId: string): AngularFireObject<Submission>[] {
        return [
            this.db.object(`/submissionsByUser/${userId}/${questionId}`),
            this.db.object(`/submissionsByQuestion/${questionId}/${userId}`)
        ];
    }
}
