import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {isNullOrUndefined} from "util";
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import {Question} from "../data/question";
import {Submission} from "../data/submission";

@Injectable()
export class SubmissionService {

    constructor(private db: AngularFireDatabase) {

    }

    public getSubmissionsByQuestion(question: Observable<Question> | string): Observable<Submission[]> {
        let query = {
            query: {
                orderByChild: 'submitted_on'
            }
        };

        let questionObservable: Observable<any>;

        if (question instanceof Observable) {
            questionObservable = question;
        }
        else {
            questionObservable = Observable.of(question);
        }

        return questionObservable.flatMap(question => {
                return this.db.list(`/submissionsByQuestion/${question.$key}`, query);
            }
        );
    }

    public getSubmissionByUserAndQuestion(userId: Observable<string>, question: Observable<Question>): Observable<Submission> {
        return Observable.combineLatest(userId, question)
            .flatMap(arr => this.db.object(`/submissionsByUser/${arr[0]}/${arr[1].$key}`));
    }

    public createSubmission(userId: string, questionId: string, wager: number = null): void {
        let now = {".sv": "timestamp"};
        // let now = new Date().getTime();

        let submission: any = {
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

    private getSubmissionDatabaseObjects(userId: string, questionId: string): FirebaseObjectObservable<Submission>[] {
        return [
            this.db.object(`/submissionsByUser/${userId}/${questionId}`),
            this.db.object(`/submissionsByQuestion/${questionId}/${userId}`)
        ];
    }
}
