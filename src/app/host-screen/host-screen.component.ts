import {Component} from "@angular/core";
import {Observable} from "rxjs";
import {QuestionService} from "../shared/question.service";
import {AnswerService} from "../shared/answer.service";
import {SubmissionService} from "../shared/submission.service";
import {UserService} from "../shared/user.service";
import {GameService} from "../shared/game.service";
import {isNullOrUndefined} from "util";

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
    public gameStartedModel: boolean = false;

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
            let map: Map<string,boolean> = new Map<string,boolean>();
            this.answerModel = [];

            s2.forEach(s => map.set(s.$key, s.correct));

            s1.forEach((s, i) => {
                if (map.has(s.$key)) {
                    this.answerModel[i] = `${map.get(s.$key)}`;
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

    public onResetQuestion(): void {
        this.questionService.resetLatestQuestion();
    }

    public onNewQuestionSubmit(): void {
        this.questionService.createNewQuestion(this.valueModel);
        this.valueModel = null;
    }

    public onGameStartedChange(gameStarted: boolean): void {
        if (gameStarted) {
            this.gameService.startGame();
        }
        else {
            this.gameService.stopGame();
        }
    }

    public onAnswerStateChange(uid: string, event: string): void {
        if (isNullOrUndefined(event)) {
            this.answerService.removeAnswer(uid, this.question.$key);
        }
        else {
            let isCorrect: boolean = event.trim().toLowerCase() === 'true';
            this.answerService.setAnswer(uid, this.question.$key, isCorrect);
        }
    }
}
