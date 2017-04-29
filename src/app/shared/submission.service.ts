import {Injectable} from '@angular/core';
import {AngularFire, FirebaseObjectObservable} from "angularfire2";
import {Observable} from "rxjs";
import {isNullOrUndefined} from "util";
import {Wager} from "./wager";

@Injectable()
export class SubmissionService {

    constructor(private af: AngularFire) {

    }

    public getSubmissionsByQuestion(question: Observable<any>) {
        let query = {
            query: {
                orderByChild: 'submitted_on'
            }
        };

        return question.flatMap(question => {
                return this.af.database.list(`/submissionsByQuestion/${question.$key}`, query);
            }
        );
    }

    public getSubmissionByUserAndQuestion(userId: Observable<string>, question: Observable<any>){
        return Observable.combineLatest(userId, question)
            .flatMap(arr => this.af.database.object(`/submissionsByUser/${arr[0]}/${arr[1].$key}`));
    }

    public createSubmission(userId: string, questionId: string, wager: Wager = null) {
        let now = {".sv": "timestamp"};
        // let now = new Date().getTime();

        let submission: any = {submitted_on: now};

        if (wager) {
            submission.wager = wager;
        }

        this.getSubmissionDatabaseObjects(userId, questionId).forEach(submissionDatabaseObject => {
            submissionDatabaseObject.set(submission)
        });
    }

    public removeSubmission(userId: string, questionId: string) {
        this.getSubmissionDatabaseObjects(userId, questionId).forEach(submissionDatabaseObject => {
            submissionDatabaseObject.remove();
        });
    }

    private getSubmissionDatabaseObjects(userId: string, questionId: string): FirebaseObjectObservable<any>[] {
        return [
            this.af.database.object(`/submissionsByUser/${userId}/${questionId}`),
            this.af.database.object(`/submissionsByQuestion/${questionId}/${userId}`)
        ];
    }
}
