import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {Component, OnDestroy, OnInit} from "@angular/core";
import * as moment from "moment";
import {UserService} from "../shared/services/user.service";
import Utils from "../shared/utils";
import {AnswerService} from "../shared/services/answer.service";
import {QuestionService} from "../shared/services/question.service";
import {isNullOrUndefined} from "util";
import {map, takeUntil} from "rxjs/operators";

@Component({
    selector: 'app-scoreboard-screen',
    templateUrl: './scoreboard-screen.component.html',
    styleUrls: ['./scoreboard-screen.component.css']
})
export class ScoreboardScreenComponent implements OnInit, OnDestroy {

    public userScores: any[];
    public dateRange: Date[] = [];

    public thisMonth: Date[];
    public lastMonth: Date[];
    public thisYear: Date[];
    public lastYear: Date[];

    private dateRangeSubject: Subject<Date[]>;
    private onDestroy: Subject<boolean>;

    constructor(private userService: UserService,
                private answerService: AnswerService,
                private questionService: QuestionService) {
    }

    public ngOnInit(): void {
        this.onDestroy = new Subject<boolean>();

        this.thisMonth = [
            moment().startOf('month').toDate(),
            moment().endOf('month').toDate()
        ];

        this.lastMonth = [
            moment().subtract(1, 'month').startOf('month').toDate(),
            moment().subtract(1, 'month').endOf('month').toDate()
        ];

        this.thisYear = [
            moment().startOf('year').toDate(),
            moment().endOf('year').toDate()
        ];

        this.lastYear = [
            moment().subtract(1, 'year').startOf('year').toDate(),
            moment().subtract(1, 'year').endOf('year').toDate()
        ];

        this.dateRange = this.thisMonth;
        this.dateRangeSubject = new BehaviorSubject(this.dateRange);

        let dateRange$ = this.dateRangeSubject.asObservable();

        let answers = this.answerService.listAnswersByQuestionWithinDateRange(dateRange$);
        let questions = this.questionService.listQuestionsWithinDateRange(dateRange$);
        let users = this.userService.getUsers();

        combineLatest([answers, questions, users]).pipe(
            map(result => {
                    let answers = result[0];
                    let questions = result[1];
                    let users = result[2];

                    let userScoreMap: Map<string, number> = new Map<string, number>();
                    let questionValueMap: Map<string, number> = new Map<string, number>();
                    let userScoreList: any[] = [];

                    questions.forEach(question => questionValueMap.set(question.key, question.value));

                    answers.forEach(answer => {
                        Object.keys(answer).forEach(key => {
                            if (!userScoreMap.has(key)) {
                                userScoreMap.set(key, 0);
                            }

                            let modifier: number = answer[key].correct === true ? 1 : -1;
                            let questionValue: number = !isNullOrUndefined(answer[key].wager) ? answer[key].wager : questionValueMap.get(answer[key].question);
                            let userTotalScore: number = userScoreMap.get(key) + (questionValue * modifier);

                            userScoreMap.set(key, userTotalScore);
                        })
                    });

                    userScoreMap.forEach((score, user) => {
                        userScoreList.push({
                            name: users[`${user}`].name,
                            value: score
                        })
                    });

                    userScoreList.sort((o1, o2) => {
                        let scoreComparison: number = Utils.compare(o2.value, o1.value);

                        if (scoreComparison != 0) {
                            return scoreComparison;
                        } else {
                            return Utils.compare(Utils.getLastName(o1.name), Utils.getLastName(o2.name));
                        }
                    });

                    return userScoreList;
                }
            ),
            takeUntil(this.onDestroy)
        ).subscribe(userScoreList => {
            this.userScores = userScoreList
        });
    }

    public ngOnDestroy(): void {
        this.onDestroy.next(true);
        this.onDestroy.unsubscribe();
    }

    public onDateSelection(value: Date[]) {
        this.dateRange = value;
        this.dateRangeSubject.next(value);
    }
}
