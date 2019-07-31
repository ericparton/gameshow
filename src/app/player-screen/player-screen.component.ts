import {combineLatest, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {isNullOrUndefined} from "util";
import {QuestionService} from "../shared/services/question.service";
import {GameService} from "../shared/services/game.service";
import {SubmissionService} from "../shared/services/submission.service";
import {AnswerService} from "../shared/services/answer.service";
import {UserService} from "../shared/services/user.service";
import * as moment from "moment";
import {Question} from "../shared/data/question";
import {Submission} from "../shared/data/submission";
import {User} from "../shared/data/user";
import {Answer} from "../shared/data/answer";

@Component({
    selector: 'app-player-screen',
    templateUrl: './player-screen.component.html',
    styleUrls: ['./player-screen.component.css']
})
export class PlayerScreenComponent implements OnInit, OnDestroy {

    public userWhoCanAnswer: User;
    public score: number;
    public isGameInProgress: boolean;
    public question: Question;
    public submission: Submission;
    public answer: Answer;
    public userWhoCanAnswerLoading: boolean = true;
    public submissionLoading: boolean = true;
    public wagerModel: number;
    public guessModel: string;
    public userId: string;
    public wagerHasError: boolean;
    public onDestroy: Subject<boolean>;

    @ViewChild('wagerModal', {static: true})
    public wagerModal;

    @ViewChild('guessModal', {static: true})
    public guessModal;

    constructor(private questionService: QuestionService,
                private gameService: GameService,
                private submissionService: SubmissionService,
                private answerService: AnswerService,
                private userService: UserService) {}

    ngOnInit(): void {
        this.onDestroy = new Subject<boolean>();

        let startDate = moment().startOf('month').toDate();

        let question$ = this.questionService.getLatestQuestion().pipe();
        let userId$ = this.userService.getCurrentUserId();
        let submissions$ = this.submissionService.getSubmissionsByQuestion(question$);
        let userAnswers$ = this.answerService.getAnswersByUserStartingAt(userId$, startDate);
        let questionAnswers$ = this.answerService.getAnswersByQuestion(question$);
        let questions$ = this.questionService.listQuestionsStartingAt(startDate);
        let users$ = this.userService.getUsers();

        combineLatest([userAnswers$, questions$]).pipe(
            map(arr => {
                let answers = arr[0];
                let questions = arr[1];
                let total: number = 0;
                let questionValueMap: Map<string, number> = new Map<string, number>();

                questions.forEach(question => questionValueMap.set(question.key, question.value));

                answers.forEach(answer => {
                    let value = !isNullOrUndefined(answer.wager) ? answer.wager : questionValueMap.get(answer.question);
                    total += (value * (answer.correct === true ? 1 : -1))
                });

                return total;
            }),
            takeUntil(this.onDestroy)
        ).subscribe(score => {
            this.score = score;
        });

        combineLatest([submissions$, questionAnswers$, users$]).pipe(
            map(result => {
                let submissions: Submission[] = result[0];
                let questionAnswers: any[] = result[1];
                let users: {string: User} = result[2];
                let user: User = null;

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
            }),
            // bufferTime(500),
            // map(array => array[array.length - 1]),
            takeUntil(this.onDestroy)
        ).subscribe(userWhoCanAnswer => {
            this.userWhoCanAnswer = userWhoCanAnswer;
            this.userWhoCanAnswerLoading = false;
        });

        question$.pipe(takeUntil(this.onDestroy)).subscribe(question => {
            this.question = question;
        });

        userId$.pipe(takeUntil(this.onDestroy)).subscribe(userId => {
            this.userId = userId
        });

        this.gameService.isGameInProgress().pipe(takeUntil(this.onDestroy)).subscribe(isGameInProgress => {
            this.isGameInProgress = isGameInProgress;
        });

        this.submissionService.getSubmissionByUserAndQuestion(userId$, question$).pipe(takeUntil(this.onDestroy)).subscribe(submission => {
            this.submission = submission;
            this.submissionLoading = false;
        });

        this.answerService.getAnswerByUserAndQuestion(userId$, question$).pipe(takeUntil(this.onDestroy)).subscribe(answer => {
            this.answer = answer;
        });
    }

    ngOnDestroy(): void {
        this.onDestroy.next(true);
        this.onDestroy.unsubscribe();
    }

    onQuestionButtonClick() {
        if (this.question.wagerRequired) {
            if (isNullOrUndefined(this.submission) || isNullOrUndefined(this.submission.wager)) {
                this.wagerModal.show()
            } else {
                this.guessModal.show()
            }
        } else {
            this.userWhoCanAnswerLoading = true;
            this.submissionService.createSubmission(this.userId, this.question.key);
        }
    }

    onWagerSubmit() {
        if (this.wagerModel > Math.max(this.score, 2000)) {
            this.wagerHasError = true;
        } else {
            this.submissionLoading = true;
            this.submissionService.createSubmission(this.userId, this.question.key, this.wagerModel);
            this.onWagerModalCloseClick();
        }
    }

    onGuessSubmit() {
        this.submissionLoading = true;
        this.submissionService.setSubmissionText(this.userId, this.question.key, this.guessModel);
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

    getColor(score: number) {
        if (isNullOrUndefined(score) || score == 0) {
            return "white";
        } else if (score > 0) {
            return "#4dff4d";
        } else {
            return "#ff4d4d";
        }
    }
}
