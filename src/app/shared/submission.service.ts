import {Injectable} from '@angular/core';
import { AngularFire, FirebaseObjectObservable } from "angularfire2";
import {Observable} from "rxjs";

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

    public createSubmission(userId: string, questionId: string) {
        // let now = {".sv":"timestamp"};
        let now = new Date().getTime();

        this.getSubmissionDatabaseObjects(userId, questionId).forEach(submissionDatabaseObject => {
            submissionDatabaseObject.set({submitted_on: now})
        });
    }

    public removeSubmission(userId: string, questionId: string){
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
