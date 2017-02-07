import {Component} from "@angular/core";
import {Observable} from "rxjs";
import {isNullOrUndefined} from "util";
import {QuestionService} from "../shared/question.service";
import {GameService} from "../shared/game.service";
import {SubmissionService} from "../shared/submission.service";
import {AnswerService} from "../shared/answer.service";
import {UserService} from "../shared/user.service";
import * as moment from "moment";
import Moment = moment.Moment;

@Component({
    selector: 'app-player-screen',
    templateUrl: './player-screen.component.html',
    styleUrls: ['./player-screen.component.css']
})
export class PlayerScreenComponent {

    public place: Observable<number>;
    public money: Observable<number>;
    public isGameInProgress: Observable<boolean>;
    public question: Observable<any>;
    public isAnswerCorrect: Observable<any>;

    private userId: string;
    private questionKey: string;

    constructor(private questionService: QuestionService,
                private gameService: GameService,
                private submissionService: SubmissionService,
                private answerService: AnswerService,
                private userService: UserService) {

        this.question = this.questionService.getLatestQuestion();

        let startDate = moment().startOf('month').toDate();
        let userId = this.userService.getCurrentUserId();
        let submissions = this.submissionService.getSubmissionsByQuestion(this.question);
        let answers = this.answerService.getAnswersByUserStartingAt(userId, startDate);
        let questions = this.questionService.listQuestionsStartingAt(startDate);

        this.isAnswerCorrect = this.answerService.isAnswerCorrect(userId, this.question);
        this.isGameInProgress = this.gameService.isGameInProgress();

        this.money = Observable.combineLatest(answers, questions, (answers, questions) => {
            let total: number = 0;
            let questionValueMap: Map<string,number> = new Map<string,number>();

            questions.forEach(question => questionValueMap.set(question.$key, question.value));
            answers.forEach(answer => total += (questionValueMap.get(answer.$key) * (answer.correct === true ? 1 : -1)));

            return total;
        });

        this.place = Observable.combineLatest(submissions, userId).map(result => {
            let submissions: any[] = result[0];
            let userId: string = result[1];

            for (let _i = 0; _i < submissions.length; _i++) {
                if (submissions[_i].$key === userId) {
                    return _i + 1;
                }
            }

            return -1;
        });

        this.question.subscribe(question => this.questionKey = question.$key);

        userId.subscribe(userId => this.userId = userId);
    }

    onClick() {
        this.submissionService.createSubmission(this.userId, this.questionKey);
    }

    getColor(money: number) {
        if (isNullOrUndefined(money) || money >= 0) {
            return "white";
        }
        else {
            return "#ff4d4d";
        }
    }
}
