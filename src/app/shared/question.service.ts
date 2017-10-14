import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {SubmissionService} from './submission.service';
import {AnswerService} from './answer.service';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class QuestionService {

    private latestQuestion: Observable<any>;
    private latestQuestionId: string;

    constructor(private db: AngularFireDatabase,
                private submissionService: SubmissionService,
                private answerService: AnswerService) {
        this.latestQuestion = db.list('/questions', {
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
        this.submitNewQuestion({value: value});
    }

    public createNewWagerQuestion(): void {
        this.submitNewQuestion({wagerRequired: true});
    }

    public listQuestionsStartingAt(startDate: Date) {
        return this.db.list(`/questions`, {
                query: {
                    orderByKey: true,
                    startAt: `${startDate.getTime()}`
                }
            }
        );
    }

    public listQuestionsWithQuery(query: Observable<any>) {
        return query.flatMap(query => this.db.list('/questions', query));
    }

    private submitNewQuestion(question: any) {
        let now: Date = new Date();
        this.db.object(`/questions/${now.getTime()}`).set(question);
    }
}
