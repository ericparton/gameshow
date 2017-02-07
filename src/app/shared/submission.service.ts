import {Injectable} from '@angular/core';
import {AngularFire} from "angularfire2";
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

    public createSubmission(userId: string, questionKey: string) {
        let now = new Date().getTime();

        let submissionDatabaseObjects = [
            this.af.database.object(`/submissionsByUser/${userId}/${questionKey}`),
            this.af.database.object(`/submissionsByQuestion/${questionKey}/${userId}`)
        ];

        submissionDatabaseObjects.forEach(submissionDatabaseObject => {
            submissionDatabaseObject.set({submitted_on: now})
        });
    }
}
