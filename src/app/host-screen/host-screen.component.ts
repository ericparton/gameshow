import {combineLatest, Observable, Subject} from 'rxjs';
import {first, map, takeUntil} from 'rxjs/operators';
import {Component, OnDestroy, OnInit} from "@angular/core";
import {QuestionService} from "../shared/services/question.service";
import {AnswerService} from "../shared/services/answer.service";
import {SubmissionService} from "../shared/services/submission.service";
import {UserService} from "../shared/services/user.service";
import {GameService} from "../shared/services/game.service";
import {isNullOrUndefined} from "util";
import {Question} from "../shared/data/question";
import {User} from "../shared/data/user";
import {Submission} from "../shared/data/submission";

@Component({
    selector: 'app-host-screen',
    templateUrl: './host-screen.component.html',
    styleUrls: ['./host-screen.component.css']
})
export class HostScreenComponent implements OnInit, OnDestroy {

    public submissions: Observable<Submission[]>;
    public users: Observable<{string: User}>;

    public question: Question;
    public valueModel: number;
    public answerModel: string[] = [];
    public indexOfLastAnswer: number;
    public indexOfLastIncorrectAnswer;
    public isGameInProgress: boolean = false;
    public wagersEnabledModel: boolean = false;
    public defaultValues: number[] = [200, 600, 1000];

    private onDestroy: Subject<boolean>;

    constructor(private gameService: GameService,
                private questionService: QuestionService,
                private answerService: AnswerService,
                private submissionService: SubmissionService,
                private userService: UserService) {}

    public ngOnInit(): void {
        this.onDestroy = new Subject<boolean>();

        let question = this.questionService.getLatestQuestion();
        let answers = this.answerService.getAnswersByQuestion(question);
        let submissions = this.submissionService.getSubmissionsByQuestion(question);

        this.users = this.userService.getUsers();

        this.submissions = combineLatest([submissions, answers]).pipe(
            map(array => {
                let submissions = array[0];
                let answers = array[1];
                let map: Map<string, boolean> = new Map<string, boolean>();

                this.answerModel = [];

                answers.forEach(answer => map.set(answer.user, answer.correct));

                submissions.forEach((submission, index) => {
                    if (map.has(submission.user)) {
                        let value = `${map.get(submission.user)}`;
                        this.answerModel[index] = `${map.get(submission.user)}`;

                        if (!isNullOrUndefined(value)) {
                            this.indexOfLastAnswer = index;
                        }
                        if (value === 'false') {
                            this.indexOfLastIncorrectAnswer = index;
                        }
                    }
                });

                return submissions;
            })
        );

        this.gameService.isGameInProgress().pipe(
            takeUntil(this.onDestroy)
        ).subscribe(isGameInProgress => {
            this.isGameInProgress = isGameInProgress
        });

        question.pipe(
            takeUntil(this.onDestroy)
        ).subscribe(question => {
            this.question = question
        });
    }

    public ngOnDestroy(): void {
        this.onDestroy.next(true);
        this.onDestroy.unsubscribe();
    }

    public getUser(users: any, uid: string): User {
        if (users) {
            return users[uid];
        }

        return null
    }

    public onDefaultValueSelection(value: number): void {
        this.valueModel = value;
    }

    public onResetQuestion(): void {
        this.questionService.resetLatestQuestion();
    }

    public onNewQuestionSubmit(): void {
        if (this.wagersEnabledModel) {
            this.questionService.createNewWagerQuestion();
        } else {
            this.questionService.createNewQuestion(this.valueModel);
        }

        this.valueModel = null;
        this.wagersEnabledModel = false;
    }

    public onGameStartedChange(gameStarted: boolean): void {
        if (gameStarted) {
            this.gameService.startGame();
        } else {
            this.gameService.stopGame();
        }
    }

    public onAnswerStateChange(uid: string, event: string, idx: number, wagerValue: number = null): void {
        if (isNullOrUndefined(event)) {
            this.answerService.removeAnswer(uid, this.question.key);
        } else {
            let correctedWagerValue = wagerValue;

            if (!isNullOrUndefined(correctedWagerValue)) {
                correctedWagerValue = Math.abs(correctedWagerValue);
            }

            let isCorrect: boolean = `${event}`.trim().toLowerCase() === 'true';
            this.answerService.setAnswer(uid, this.question.key, isCorrect, correctedWagerValue);

            if (!isCorrect && !this.question.wagerRequired) {
                this.submissionService.getSubmissionsByQuestion(this.question).pipe(first()).subscribe(submissions => {
                    for (let i = idx + 1; i < submissions.length; i++) {
                        if (this.canRemoveSubmission(i)) {
                            this.submissionService.removeSubmission(submissions[i].user, this.question.key)
                        }
                    }
                });
            }
        }
    }

    public canRemoveSubmission(idx: number) {
        if (!isNullOrUndefined(this.indexOfLastAnswer) && this.indexOfLastAnswer > idx) {
            return false;
        }

        if (isNullOrUndefined(this.answerModel[idx])) {
            return true;
        }

        return false;
    }

    public isAllowedToAnswer(idx: number, answerModel: string[]) {
        if (this.question.wagerRequired) {
            return true;
        }

        if (idx == 0 && answerModel.length == 1) {
            return true;
        }

        if (!isNullOrUndefined(answerModel[idx])) {
            return true;
        }

        if (isNullOrUndefined(this.indexOfLastAnswer) || this.indexOfLastAnswer > idx) {
            return true;
        }

        if (!isNullOrUndefined(this.indexOfLastIncorrectAnswer) && this.indexOfLastIncorrectAnswer + 1 === idx) {
            return true;
        }

        return false;
    }
}
