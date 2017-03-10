import { Injectable } from '@angular/core';
import { AngularFire } from "angularfire2";
import { Observable } from "rxjs";
import { SubmissionService } from './submission.service';
import { AnswerService } from './answer.service';

@Injectable()
export class QuestionService {

    private latestQuestion: Observable<any>;
    private latestQuestionId: string;

    constructor(private af: AngularFire,
                private submissionService: SubmissionService,
                private answerService: AnswerService) {
        this.latestQuestion = af.database.list('/questions', {
            query: {
                orderByKey: true,
                limitToLast: 1
            }
        }).filter(questions => questions.length > 0).map(questions => questions[0]);

        this.latestQuestion.subscribe(question => this.latestQuestionId = question['$key'])
    }

    public resetLatestQuestion(): void {
        this.answerService.getAnswersByQuestion(this.latestQuestion).first().subscribe(questions => {
            questions.forEach(question => {
                this.answerService.removeAnswer(question.$key, this.latestQuestionId)
            })
        });

        this.submissionService.getSubmissionsByQuestion(this.latestQuestion).first().subscribe(submissions => {
            submissions.forEach(submission => {
                this.submissionService.removeSubmission(submission.$key, this.latestQuestionId)
            });
        });
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
