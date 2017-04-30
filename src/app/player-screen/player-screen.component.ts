import {Component, ViewChild} from "@angular/core";
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
    public submission: Observable<any>;
    public isAnswerCorrect: Observable<any>;
    public placeLoading: boolean = false;
    public submissionLoading: boolean = false;
    public wagerModel: number;
    public guessModel: string;
    public scoreModel: number;

    private userId: string;
    private questionKey: string;
    private isWagerRequired: boolean;
    private wagerHasError: boolean;
    private currentWager: number;

    @ViewChild('wagerModal')
    private wagerModal;

    @ViewChild('guessModal')
    private guessModal;

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
        this.submission = this.submissionService.getSubmissionByUserAndQuestion(userId, this.question);

        this.money = Observable.combineLatest(answers, questions, (answers, questions) => {
            let total: number = 0;
            let questionValueMap: Map<string, number> = new Map<string, number>();

            questions.forEach(question => questionValueMap.set(question.$key, question.value));

            answers.forEach(answer => {
                let value = !isNullOrUndefined(answer.wager) ? answer.wager : questionValueMap.get(answer.$key);
                total += (value * (answer.correct === true ? 1 : -1))
            });

            this.scoreModel = total;
            return total;
        });

        this.place = Observable.combineLatest(submissions, userId).map(result => {
            let submissions: any[] = result[0];
            let userId: string = result[1];

            for (let _i = 0; _i < submissions.length; _i++) {
                if (submissions[_i].$key === userId) {
                    this.placeLoading = false;
                    return _i + 1;
                }
            }

            if (submissions.length == 0) {
                this.placeLoading = false;
            }

            return -1;
        });

        this.question.subscribe(question => {
            this.questionKey = question.$key;
            this.isWagerRequired = question.wagerRequired;
        });

        this.submission.subscribe(submission => {
            this.submissionLoading = false;
            this.currentWager = submission.wager;
        });

        userId.subscribe(userId => this.userId = userId);
    }

    onQuestionButtonClick() {
        if (this.isWagerRequired) {
            isNullOrUndefined(this.currentWager) ? this.wagerModal.show() : this.guessModal.show();
        }
        else {
            this.placeLoading = true;
            this.submissionService.createSubmission(this.userId, this.questionKey);
        }
    }

    onWagerSubmit() {
        if (this.wagerModel > this.scoreModel) {
            this.wagerHasError = true;
        }
        else {
            this.submissionLoading = true;
            this.submissionService.createSubmission(this.userId, this.questionKey, this.wagerModel);
            this.onWagerModalCloseClick();
        }
    }

    onGuessSubmit() {
        this.submissionLoading = true;
        this.submissionService.setSubmissionText(this.userId, this.questionKey, this.guessModel);
        this.onGuessModalCloseClick();
    }

    onWagerModalCloseClick() {
        this.wagerModal.hide();
        this.wagerHasError = false;
        this.wagerModel = null;
    }

    onGuessModalCloseClick() {
        this.guessModal.hide();
        this.guessModel = null;
    }

    onWagerChange() {
        if (!isNullOrUndefined(this.wagerModel)) {
            this.wagerModel = Math.abs(this.wagerModel);
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
