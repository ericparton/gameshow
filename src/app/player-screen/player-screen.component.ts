import { Component, ViewChild } from "@angular/core";
import { Observable } from "rxjs";
import { isNullOrUndefined } from "util";
import { QuestionService } from "../shared/services/question.service";
import { GameService } from "../shared/services/game.service";
import { SubmissionService } from "../shared/services/submission.service";
import { AnswerService } from "../shared/services/answer.service";
import { UserService } from "../shared/services/user.service";
import * as moment from "moment";
import Moment = moment.Moment;

@Component({
    selector: 'app-player-screen',
    templateUrl: './player-screen.component.html',
    styleUrls: ['./player-screen.component.css']
})
export class PlayerScreenComponent {

    public userWhoCanAnswer: Observable<number>;
    public money: Observable<number>;
    public isGameInProgress: Observable<boolean>;
    public question: Observable<any>;
    public submission: Observable<any>;
    public isAnswerCorrect: Observable<any>;
    public userWhoCanAnswerLoading: boolean = true;
    public submissionLoading: boolean = true;
    public wagerModel: number;
    public guessModel: string;
    public scoreModel: number;
    public userId: string;
    public questionKey: string;
    public isWagerRequired: boolean;
    public wagerHasError: boolean;
    public currentWager: number;

    @ViewChild('wagerModal')
    public wagerModal;

    @ViewChild('guessModal')
    public guessModal;

    constructor(private questionService: QuestionService,
                private gameService: GameService,
                private submissionService: SubmissionService,
                private answerService: AnswerService,
                private userService: UserService) {

        this.question = this.questionService.getLatestQuestion();

        let startDate = moment().startOf('month').toDate();
        let userId = this.userService.getCurrentUserId();
        let submissions = this.submissionService.getSubmissionsByQuestion(this.question);
        let userAnswers = this.answerService.getAnswersByUserStartingAt(userId, startDate);
        let questionAnswers = this.answerService.getAnswersByQuestion(this.question);
        let questions = this.questionService.listQuestionsStartingAt(startDate);
        let users = this.userService.getUsers();

        this.isAnswerCorrect = this.answerService.isAnswerCorrect(userId, this.question);
        this.isGameInProgress = this.gameService.isGameInProgress();
        this.submission = this.submissionService.getSubmissionByUserAndQuestion(userId, this.question);

        this.money = Observable.combineLatest(userAnswers, questions, (answers, questions) => {
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

        this.userWhoCanAnswer = Observable.combineLatest(submissions, questionAnswers, users).map(result => {
            let submissions: any[] = result[0];
            let questionAnswers: any[] = result[1];
            let users: any[] = result[2];
            let user: any = null;

            let answerCorrectnessMap: Map<string, boolean> = new Map<string, boolean>();

            submissions.sort((o1, o2) => {
                return o1.submitted_on - o2.submitted_on;
            });

            questionAnswers.forEach((answer) => {
                answerCorrectnessMap.set(answer.user, answer.correct);
            });

            for (let i = 0; i < submissions.length; i++) {
                let submission = submissions[i];
                let hasCorrectAnswer = answerCorrectnessMap.get(submission.user) == true;

                if (hasCorrectAnswer || !answerCorrectnessMap.has(submission.user)) {
                    user = users[submission.user];
                    break;
                }
            }

            return user;
        });

        this.question.subscribe(question => {
            this.questionKey = question.$key;
            this.isWagerRequired = question.wagerRequired;
        });

        this.submission.subscribe(submission => {
            this.submissionLoading = false;
            this.currentWager = submission.wager;
        });

        this.userWhoCanAnswer.subscribe( () => {
            this.userWhoCanAnswerLoading = false;
        });

        userId.subscribe(userId => this.userId = userId);
    }

    onQuestionButtonClick() {
        if (this.isWagerRequired) {
            isNullOrUndefined(this.currentWager) ? this.wagerModal.show() : this.guessModal.show();
        }
        else {
            this.userWhoCanAnswerLoading = true;
            this.submissionService.createSubmission(this.userId, this.questionKey);
        }
    }

    onWagerSubmit() {
        if (this.wagerModel > Math.max(this.scoreModel, 2000)) {
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
