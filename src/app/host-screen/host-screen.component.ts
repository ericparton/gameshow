import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { QuestionService } from "../shared/question.service";
import { AnswerService } from "../shared/answer.service";
import { SubmissionService } from "../shared/submission.service";
import { UserService } from "../shared/user.service";
import { GameService } from "../shared/game.service";
import { isNullOrUndefined } from "util";

@Component({
    selector: 'app-host-screen',
    templateUrl: './host-screen.component.html',
    styleUrls: ['./host-screen.component.css']
})
export class HostScreenComponent {

    public responses: Observable<any[]>;
    public users: Observable<any>;
    public isGameInProgress: Observable<boolean>;

    public question: any;
    public valueModel: number;
    public answerModel: string[] = [];
    public indexOfLastAnswer: number;
    public indexOfLastIncorrectAnswer;
    public gameStartedModel: boolean = false;
    public wagersEnabledModel: boolean = false;
    public defaultValues: number[] = [200, 600, 1000];

    constructor(private gameService: GameService,
                private questionService: QuestionService,
                private answerService: AnswerService,
                private submissionService: SubmissionService,
                private userService: UserService) {

        let question = questionService.getLatestQuestion();
        let answers = answerService.getAnswersByQuestion(question);
        let submissions = submissionService.getSubmissionsByQuestion(question);

        this.users = userService.getUsers();
        this.isGameInProgress = gameService.isGameInProgress();

        this.responses = Observable.combineLatest(submissions, answers, (s1, s2) => {
            let map: Map<string, boolean> = new Map<string, boolean>();
            this.answerModel = [];
            this.indexOfLastAnswer;
            this.indexOfLastIncorrectAnswer;

            s2.forEach(s => map.set(s.$key, s.correct));

            s1.forEach((s, i) => {
                if (map.has(s.$key)) {
                    let value = `${map.get(s.$key)}`;
                    this.answerModel[i] = `${map.get(s.$key)}`;

                    if (!isNullOrUndefined(value)) {
                        this.indexOfLastAnswer = i;
                    }
                    if (value === 'false') {
                        this.indexOfLastIncorrectAnswer = i;
                    }
                }
            });

            return s1;
        });

        this.isGameInProgress.subscribe(isGameInProgress => this.gameStartedModel = isGameInProgress);

        question.subscribe(q => this.question = q);
    }

    public getUser(users: any, uid: string): any {
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
        }
        else {
            this.questionService.createNewQuestion(this.valueModel);
        }

        this.valueModel = null;
        this.wagersEnabledModel = false;
    }

    public onGameStartedChange(gameStarted: boolean): void {
        if (gameStarted) {
            this.gameService.startGame();
        }
        else {
            this.gameService.stopGame();
        }
    }

    public onAnswerStateChange(uid: string, event: string, idx: number, wagerValue: number = null): void {
        if (isNullOrUndefined(event)) {
            this.answerService.removeAnswer(uid, this.question.$key);
        }
        else {
            let correctedWagerValue = wagerValue;

            if (!isNullOrUndefined(correctedWagerValue)) {
                correctedWagerValue = Math.abs(correctedWagerValue);
            }

            let isCorrect: boolean = `${event}`.trim().toLowerCase() === 'true';
            this.answerService.setAnswer(uid, this.question.$key, isCorrect, correctedWagerValue);

            if (!isCorrect && !this.question.wagerRequired) {
                this.submissionService.getSubmissionsByQuestion(this.question).first().subscribe(submissions => {
                    for (let i = idx + 1; i < submissions.length; i++) {
                        if (this.canRemoveSubmission(i)) {
                            this.submissionService.removeSubmission(submissions[i].$key, this.question.$key)
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
