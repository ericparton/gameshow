import {Component, ViewChild} from "@angular/core";
import {Observable} from "rxjs";
import {isNullOrUndefined} from "util";
import {QuestionService} from "../shared/question.service";
import {GameService} from "../shared/game.service";
import {SubmissionService} from "../shared/submission.service";
import {AnswerService} from "../shared/answer.service";
import {UserService} from "../shared/user.service";
import {Wager} from "../shared/wager";
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
    public submission: Observable<any>;
    public isAnswerCorrect: Observable<any>;
    public loading: boolean = false;
    public wagerValueModel: number;
    public wagerGuessModel: string;
    public scoreModel: number;

    @ViewChild('wagerModal')
    private wagerModal;

    private userId: string;
    private questionKey: string;
    private isWagerRequired: boolean;
    private wagerHasError: boolean;

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
            let questionValueMap: Map<string, number> = new Map<string, number>();

            questions.forEach(question => questionValueMap.set(question.$key, question.value));

            answers.forEach(answer => {
                let value = answer.wager ? answer.wager : questionValueMap.get(answer.$key);
                total += (value * (answer.correct === true ? 1 : -1))
            });

            this.scoreModel = total;
            return total;
        });

        this.submission = this.submissionService.getSubmissionByUserAndQuestion(userId, this.question);

        this.place = Observable.combineLatest(submissions, userId).map(result => {
            let submissions: any[] = result[0];
            let userId: string = result[1];

            for (let _i = 0; _i < submissions.length; _i++) {
                if (submissions[_i].$key === userId) {
                    this.loading = false;
                    return _i + 1;
                }
            }

            if (submissions.length == 0) {
                this.loading = false;
            }

            return -1;
        });

        this.question.subscribe(question => {
            this.questionKey = question.$key;
            this.isWagerRequired = question.wagerRequired;
        });

        userId.subscribe(userId => this.userId = userId);
    }

    onQuestionButtonClick() {
        if (this.isWagerRequired) {
            this.wagerModal.show();
        }
        else {
            this.loading = true;
            this.submissionService.createSubmission(this.userId, this.questionKey);
        }
    }

    onWagerSubmit() {
        if (this.wagerValueModel > this.scoreModel) {
            this.wagerHasError = true;
        }
        else {
            let wager = new Wager(this.wagerValueModel, this.wagerGuessModel);

            this.loading = true;
            this.submissionService.createSubmission(this.userId, this.questionKey, wager);
            this.onWagerModalCloseClick();
        }
    }

    onWagerModalCloseClick() {
        this.wagerModal.hide();
        this.wagerHasError = false;
        this.wagerValueModel = null;
        this.wagerGuessModel = null;
    }

    onWagerValueChange() {
        if(!isNullOrUndefined(this.wagerValueModel)){
            this.wagerValueModel = Math.abs(this.wagerValueModel);
        }
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
