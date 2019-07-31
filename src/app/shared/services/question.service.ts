
import {mergeMap, first, map, filter} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {SubmissionService} from './submission.service';
import {AnswerService} from './answer.service';
import {Question} from "../data/question";
import {AngularFireDatabase} from "@angular/fire/database";

@Injectable()
export class QuestionService {

    private latestQuestion: Observable<Question>;
    private latestQuestionId: string;

    constructor(private db: AngularFireDatabase,
                private submissionService: SubmissionService,
                private answerService: AnswerService) {
        this.latestQuestion = db
            .list<Question>('/questions', ref => ref.orderByKey().limitToLast(1))
            .valueChanges().pipe(
            filter(questions => questions.length > 0),map(questions => questions[0]),);

        this.latestQuestion.subscribe(question => this.latestQuestionId = question.key)
    }

    public resetLatestQuestion(): void {
        this.answerService.getAnswersByQuestion(this.latestQuestion).pipe(first()).subscribe(answers => {
            answers.forEach(answer => {
                this.answerService.removeAnswer(answer.user, this.latestQuestionId)
            })
        });

        this.submissionService.getSubmissionsByQuestion(this.latestQuestion).pipe(first()).subscribe(submissions => {
            submissions.forEach(submission => {
                this.submissionService.removeSubmission(submission.user, this.latestQuestionId)
            });
        });
    }

    public getLatestQuestion(): Observable<Question> {
        return this.latestQuestion;
    }

    public createNewQuestion(value: number): void {
        this.submitNewQuestion({value: value});
    }

    public createNewWagerQuestion(): void {
        this.submitNewQuestion({wagerRequired: true});
    }

    public listQuestionsStartingAt(startDate: Date): Observable<Question[]> {
        return this.db.list<Question>(`/questions`, ref => {
            return ref.orderByKey().startAt(`${startDate.getTime()}`);
        }).valueChanges();
    }

    public listQuestionsWithinDateRange(dateRange: Observable<Date[]>): Observable<Question[]> {
        return dateRange.pipe(
            mergeMap(dateRange => {
                return this.db.list<Question>('/questions', ref => {
                    return ref.orderByKey().startAt(`${dateRange[0].valueOf()}`).endAt(`${dateRange[1].valueOf()}`);
                }).valueChanges();
            })
        );
    }

    private submitNewQuestion(question: Question): void {
        question.key = `${new Date().getTime()}`;
        this.db.object(`/questions/${question.key}`).set(question);
    }
}
